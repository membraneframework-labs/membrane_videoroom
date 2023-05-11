import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DeviceError,
  DeviceReturnType,
  DeviceState,
  Errors,
  GetMedia,
  Media,
  Type,
  UseUserMedia,
  UseUserMediaConfig,
  UseUserMediaStartConfig,
  UseUserMediaState,
} from "./type";
import {
  getExactDeviceConstraint,
  prepareConstraints,
  prepareMediaTrackConstraints,
  removeExact,
  toMediaTrackConstraints,
} from "./constraints";
import { log, warn } from "./debug";
import { NOT_REQUESTED, PERMISSION_DENIED, REQUESTING } from "./constants";
import {
  enumerateDevices,
  getCurrentDevicesSettings,
  getDeviceInfo,
  isAnyDeviceDifferentFromLastSession,
  isAudio,
  isVideo,
  parseError,
} from "./device-utils";

// TODO After some testing this hook should be prepareDeviceState to browser-media-utils

const stopTracks = (requestedDevices: MediaStream) => {
  requestedDevices.getTracks().forEach((track) => {
    track.stop();
  });
};

const getMedia = async (
  constraints: MediaStreamConstraints,
  previousErrors: Errors,
  logIdentifier?: string
): Promise<GetMedia> => {
  try {
    log({ name: `${logIdentifier} invoked`, constraints, errors: previousErrors });

    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    log(`%c${logIdentifier} succeeded`, "color: green");
    return { stream: mediaStream, type: "OK", constraints, previousErrors };
  } catch (error: unknown) {
    warn({ error });
    const parsedError: DeviceError | null = parseError(error);
    return { error: parsedError, type: "Error", constraints };
  }
};

const handleOverconstrainedError = async (constraints: MediaStreamConstraints): Promise<GetMedia> => {
  const videoResult = await getMedia(
    { video: removeExact(constraints.video), audio: constraints.audio },
    {},
    "handleOverconstrainedError loosen video constraints"
  );
  if (videoResult.type === "OK" || videoResult.error?.name === "NotAllowedError") {
    return videoResult;
  }

  const audioResult = await getMedia(
    { video: constraints.video, audio: removeExact(constraints.audio) },
    {},
    "handleOverconstrainedError loosen audio constraints"
  );
  if (audioResult.type === "OK" || audioResult.error?.name === "NotAllowedError") {
    return audioResult;
  }

  return await getMedia(
    { video: removeExact(constraints.video), audio: removeExact(constraints.audio) },
    {},
    "handleOverconstrainedError loosen both constraints"
  );
};

const handleNotAllowedError = async (constraints: MediaStreamConstraints): Promise<GetMedia> => {
  const videoResult = await getMedia(
    { video: false, audio: constraints.audio },
    { video: PERMISSION_DENIED },
    "handleNotAllowedError disable video constraints"
  );
  if (videoResult.type === "OK") {
    return videoResult;
  }

  const audioResult = await getMedia(
    { video: constraints.video, audio: false },
    { audio: PERMISSION_DENIED },
    "handleNotAllowedError disable audio constraints"
  );
  if (audioResult.type === "OK") {
    return audioResult;
  }

  return await getMedia(
    { video: false, audio: false },
    { video: PERMISSION_DENIED, audio: PERMISSION_DENIED },
    "handleNotAllowedError disable both constraints"
  );
};

const getError = (result: GetMedia, type: "audio" | "video"): DeviceError | null => {
  if (result.type === "OK") {
    return result.previousErrors[type] || null;
  }
  return PERMISSION_DENIED;
};

const prepareStatus = (
  requested: boolean,
  track: MediaStreamTrack | null,
  deviceError: DeviceError | null
): DeviceReturnType => {
  if (!requested) return { type: "Not requested" };
  if (track) return { type: "OK" };
  if (deviceError) return { type: "Error", error: deviceError };
  return { type: "Error", error: null };
};

const prepareDeviceState = (
  stream: MediaStream | null,
  track: MediaStreamTrack | null,
  devices: MediaDeviceInfo[],
  error: DeviceError | null,
  shouldAskForVideo: boolean
) => {
  const deviceInfo = getDeviceInfo(track?.getSettings()?.deviceId || null, devices);

  return {
    devices: devices,
    status: prepareStatus(shouldAskForVideo, track, error),
    media: {
      stream: track ? stream : null,
      track: track,
      deviceInfo,
      enabled: !!track,
    },
    error: error,
  };
};

const INITIAL_STATE: UseUserMediaState = {
  video: {
    status: { type: "Not requested" },
    media: null,
    devices: null,
    error: null,
  },
  audio: {
    status: { type: "Not requested" },
    media: null,
    devices: null,
    error: null,
  },
  devices: null,
};

/**
 * This hook is responsible for managing Media Devices and Media Streams from those devices.
 *
 * It stores all available devices and devices that are currently in use.
 *
 * It can also store previously selected devices, so it can retrieve them after a page reload.
 *
 * The inner algorithm should only open one prompt for both audio and video.
 *
 * If it's not possible to get the previous device (e.g. because the device doesn't exist),
 * it tries to recover by loosening constraints on each device one by one to overcome OverconstrainedError.
 *
 * If one device is not available (e.g. if the user closed the prompt or permanently blocked the device,
 * resulting in NotAllowedError), it tries to identify which device is not available and turns on the remaining one.
 *
 * Logs in this hook are visible on console when setting "log-device-manager" to `"true" in your LocalStorage.
 */
export const useUserMedia = ({
  getLastAudioDevice,
  saveLastAudioDevice,
  getLastVideoDevice,
  saveLastVideoDevice,
  videoTrackConstraints,
  audioTrackConstraints,
  refetchOnMount,
}: UseUserMediaConfig): UseUserMedia => {
  const [state, setState] = useState<UseUserMediaState>(INITIAL_STATE);

  useEffect(() => {
    log({ name: "stateChange", data: state });
  }, [state]);

  const audioConstraints = useMemo(() => toMediaTrackConstraints(audioTrackConstraints), [audioTrackConstraints]);
  const videoConstraints = useMemo(() => toMediaTrackConstraints(videoTrackConstraints), [videoTrackConstraints]);

  const skip = useRef<boolean>(false);

  const init = useCallback(async () => {
    if (!navigator?.mediaDevices) throw Error("Navigator is available only in secure contexts");
    if (skip.current) return;
    skip.current = true;

    const previousVideoDevice: MediaDeviceInfo | null = getLastVideoDevice();
    const previousAudioDevice: MediaDeviceInfo | null = getLastAudioDevice();

    const shouldAskForVideo = !!videoTrackConstraints;
    const shouldAskForAudio = !!audioTrackConstraints;

    setState((prevState) => ({
      ...prevState,
      video: {
        ...prevState.video,
        status: shouldAskForVideo && videoConstraints ? REQUESTING : prevState.video.status ?? NOT_REQUESTED,
      },
      audio: {
        ...prevState.audio,
        status: shouldAskForAudio && audioConstraints ? REQUESTING : prevState.audio.status ?? NOT_REQUESTED,
      },
    }));

    let requestedDevices: MediaStream | null = null;

    const constraints = {
      video: shouldAskForVideo && getExactDeviceConstraint(videoConstraints, previousVideoDevice?.deviceId),
      audio: shouldAskForAudio && getExactDeviceConstraint(audioConstraints, previousAudioDevice?.deviceId),
    };

    let result: GetMedia = await getMedia(constraints, {}, "Exact match");

    if (result.type === "Error" && result.error?.name === "OverconstrainedError") {
      result = await handleOverconstrainedError(constraints);
    }

    if (result.type === "Error" && result.error?.name === "NotAllowedError") {
      result = await handleNotAllowedError(result.constraints);
    }

    const mediaDeviceInfos: MediaDeviceInfo[] = await enumerateDevices();

    if (result.type === "OK") {
      requestedDevices = result.stream;
      // Safari changes deviceId between sessions, therefore we cannot rely on deviceId for identification purposes.
      // We can switch a random device that comes from safari to one that has the same label as the one used in the previous session.
      const currentDevices = getCurrentDevicesSettings(requestedDevices, mediaDeviceInfos);
      const shouldCorrectDevices = isAnyDeviceDifferentFromLastSession(
        previousVideoDevice,
        previousAudioDevice,
        currentDevices
      );
      if (shouldCorrectDevices) {
        const videoIdToStart = mediaDeviceInfos.find((info) => info.label === previousVideoDevice?.label)?.deviceId;
        const audioIdToStart = mediaDeviceInfos.find((info) => info.label === previousAudioDevice?.label)?.deviceId;

        if (videoIdToStart || audioIdToStart) {
          stopTracks(requestedDevices);

          const exactConstraints: MediaStreamConstraints = {
            video: prepareConstraints(!!result.constraints.video, videoIdToStart, videoConstraints),
            audio: prepareConstraints(!!result.constraints.audio, audioIdToStart, audioConstraints),
          };

          const correctedResult = await getMedia(
            exactConstraints,
            {
              video: result.previousErrors.video,
              audio: result.previousErrors.audio,
            },
            "Correct both device"
          );

          if (correctedResult.type === "OK") {
            requestedDevices = correctedResult.stream;
          } else {
            console.error("Device Manager unexpected error");
          }
        }
      }
    }

    log("%cResult", "color: orange");

    log({ result });

    const video: DeviceState = prepareDeviceState(
      requestedDevices,
      requestedDevices?.getVideoTracks()[0] || null,
      mediaDeviceInfos.filter(isVideo),
      getError(result, "video"),
      shouldAskForVideo
    );

    const audio: DeviceState = prepareDeviceState(
      requestedDevices,
      requestedDevices?.getAudioTracks()[0] || null,
      mediaDeviceInfos.filter(isAudio),
      getError(result, "audio"),
      shouldAskForAudio
    );

    setState({
      devices: mediaDeviceInfos,
      video,
      audio,
    });

    if (video.media?.deviceInfo) {
      log({ name: "saveLastVideoDevice", info: video.media.deviceInfo });
      saveLastVideoDevice(video.media.deviceInfo);
    }

    if (audio.media?.deviceInfo) {
      saveLastAudioDevice(audio.media?.deviceInfo);
    }
  }, [
    getLastVideoDevice,
    getLastAudioDevice,
    videoTrackConstraints,
    audioTrackConstraints,
    videoConstraints,
    audioConstraints,
    saveLastVideoDevice,
    saveLastAudioDevice,
  ]);

  const start = useCallback(
    async ({ audioDeviceId, videoDeviceId }: UseUserMediaStartConfig) => {
      const shouldRestartVideo = !!videoDeviceId && videoDeviceId !== state.video.media?.deviceInfo?.deviceId;
      const shouldRestartAudio = !!audioDeviceId && audioDeviceId !== state.audio.media?.deviceInfo?.deviceId;

      const exactConstraints: MediaStreamConstraints = {
        video: shouldRestartVideo && prepareMediaTrackConstraints(videoDeviceId, videoConstraints),
        audio: shouldRestartAudio && prepareMediaTrackConstraints(audioDeviceId, audioConstraints),
      };

      if (!exactConstraints.video && !exactConstraints.audio) return;

      const result = await getMedia(exactConstraints, {}, "Restart");

      if (result.type == "OK") {
        const stream = result.stream;

        if (shouldRestartVideo) {
          state?.video.media?.track?.stop();
        }

        const videoInfo = videoDeviceId ? getDeviceInfo(videoDeviceId, state.video.devices ?? []) : null;
        if (videoInfo) {
          saveLastVideoDevice(videoInfo);
        }

        if (shouldRestartAudio) {
          state?.audio.media?.track?.stop();
        }

        const audioInfo = audioDeviceId ? getDeviceInfo(audioDeviceId, state.audio.devices ?? []) : null;

        if (audioInfo) {
          saveLastAudioDevice(audioInfo);
        }

        setState((prevState): UseUserMediaState => {
          const videoMedia: Media | null = shouldRestartVideo
            ? {
                stream,
                track: stream.getVideoTracks()[0] || null,
                deviceInfo: videoInfo,
                enabled: true,
              }
            : prevState.video.media;

          const audioMedia: Media | null = shouldRestartAudio
            ? {
                stream,
                track: stream.getAudioTracks()[0] || null,
                deviceInfo: audioInfo,
                enabled: true,
              }
            : prevState.audio.media;

          return {
            ...prevState,
            video: { ...prevState.video, media: videoMedia },
            audio: { ...prevState.audio, media: audioMedia },
          };
        });
      } else {
        const parsedError = result.error;

        setState((prevState) => {
          const videoError = exactConstraints.video ? parsedError : prevState.video.error;
          const audioError = exactConstraints.audio ? parsedError : prevState.audio.error;

          return {
            ...prevState,
            video: { ...prevState.video, error: videoError },
            audio: { ...prevState.audio, error: audioError },
          };
        });
      }
    },
    [state, audioConstraints, saveLastAudioDevice, videoConstraints, saveLastVideoDevice]
  );

  const stop = useCallback(async (type: Type) => {
    setState((prevState) => {
      prevState?.[type]?.media?.track?.stop();

      return { ...prevState, [type]: { ...prevState[type], media: null } };
    });
  }, []);

  const setEnable = useCallback((type: Type, value: boolean) => {
    setState((prevState) => {
      const media = prevState[type].media;
      if (!media || !media.track) {
        return prevState;
      }

      media.track.enabled = value;

      return { ...prevState, [type]: { ...prevState[type], media: { ...media, enabled: value } } };
    });
  }, []);

  useEffect(() => {
    if (refetchOnMount) {
      init();
    }
    // eslint-disable-next-line
  }, []);

  return useMemo(
    () => ({
      data: state,
      start,
      stop,
      init,
      setEnable,
    }),
    [start, state, stop, init, setEnable]
  );
};
