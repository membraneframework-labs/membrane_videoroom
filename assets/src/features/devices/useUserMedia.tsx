import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// TODO After some testing this hook should be extracted to browser-media-utils

export const isGranted = (mediaDeviceInfo: MediaDeviceInfo) =>
  mediaDeviceInfo.label !== "" && mediaDeviceInfo.deviceId !== "";

export const isVideo = (it: MediaDeviceInfo) => it.kind === "videoinput";
export const isAudio = (it: MediaDeviceInfo) => it.kind === "audioinput";

export const toMediaTrackConstraints = (
  constraint?: boolean | MediaTrackConstraints
): MediaTrackConstraints | undefined => {
  if (typeof constraint === "boolean") {
    return constraint ? {} : undefined;
  }
  return constraint;
};

export type MediaType = "audio" | "video";

export type DeviceReturnType =
  | { type: "OK" }
  | { type: "Error"; error: DeviceError | null }
  | { type: "Not requested" }
  | { type: "Requesting" };

export type Media = {
  stream: MediaStream | null;
  track: MediaStreamTrack | null;
  enabled: boolean;
  deviceInfo: MediaDeviceInfo | null;
};

export type UseUserMediaState = {
  videoStatus: DeviceReturnType;
  audioStatus: DeviceReturnType;
  videoMedia: Media | null;
  audioMedia: Media | null;
  videoError: DeviceError | null;
  audioError: DeviceError | null;
  videoDevices: MediaDeviceInfo[] | null;
  audioDevices: MediaDeviceInfo[] | null;
  devices: MediaDeviceInfo[] | null;
};

export type UseUserMediaConfig = {
  getLastAudioDevice: () => MediaDeviceInfo | null;
  saveLastAudioDevice: (info: MediaDeviceInfo) => void;
  getLastVideoDevice: () => MediaDeviceInfo | null;
  saveLastVideoDevice: (info: MediaDeviceInfo) => void;
  videoTrackConstraints: boolean | MediaTrackConstraints;
  audioTrackConstraints: boolean | MediaTrackConstraints;
  refetchOnMount: boolean;
};

export type UseUserMediaStartConfig = {
  audioDeviceId?: string;
  videoDeviceId?: string;
};

export type UseUserMedia = {
  data: UseUserMediaState | null;
  start: (config: UseUserMediaStartConfig) => void;
  stop: (type: MediaType) => void;
  setEnable: (type: MediaType, value: boolean) => void;
  init: (videoParam: boolean | MediaTrackConstraints, audioParam: boolean | MediaTrackConstraints) => void;
};

const prepareMediaTrackConstraints = (
  deviceId: string | undefined,
  constraints: MediaTrackConstraints | undefined
): MediaTrackConstraints | boolean => {
  if (!deviceId) return false;
  const exactId: Pick<MediaTrackConstraints, "deviceId"> = deviceId ? { deviceId: { exact: deviceId } } : {};
  return { ...constraints, ...exactId };
};

const getDeviceInfo = (trackDeviceId: string | null, devices: MediaDeviceInfo[]): MediaDeviceInfo | null =>
  trackDeviceId ? devices.find(({ deviceId }) => trackDeviceId === deviceId) || null : null;

type CurrentDevices = { videoinput: MediaDeviceInfo | null; audioinput: MediaDeviceInfo | null };

const getCurrentDevicesSettings = (
  requestedDevices: MediaStream,
  mediaDeviceInfos: MediaDeviceInfo[]
): CurrentDevices => {
  const currentDevices: CurrentDevices = { videoinput: null, audioinput: null };

  requestedDevices.getTracks().forEach((track) => {
    const settings = track.getSettings();
    if (settings.deviceId) {
      const currentDevice = mediaDeviceInfos.find((device) => device.deviceId == settings.deviceId);
      const kind = currentDevice?.kind || null;
      if ((currentDevice && kind && kind === "videoinput") || kind === "audioinput") {
        currentDevices[kind] = currentDevice || null;
      }
    }
  });
  return currentDevices;
};

const isDeviceDifferentFromLastSession = (
  lastDevice: MediaDeviceInfo | null,
  currentDevices: MediaDeviceInfo | null
) => {
  return (
    lastDevice && (currentDevices?.deviceId !== lastDevice.deviceId || currentDevices?.label !== lastDevice?.label)
  );
};

const isAnyDeviceDifferentFromLastSession = (
  lastVideoDevice: MediaDeviceInfo | null,
  lastAudioDevice: MediaDeviceInfo | null,
  currentDevices: CurrentDevices | null
): boolean =>
  !!(
    (currentDevices?.videoinput &&
      isDeviceDifferentFromLastSession(lastVideoDevice, currentDevices?.videoinput || null)) ||
    (currentDevices?.audioinput &&
      isDeviceDifferentFromLastSession(lastAudioDevice, currentDevices?.audioinput || null))
  );

const stopTracks = (requestedDevices: MediaStream) => {
  requestedDevices.getTracks().forEach((track) => {
    track.stop();
  });
};

const getExactConstraints = (
  shouldAskForVideo: boolean,
  videoConstraints: MediaTrackConstraints | undefined,
  previousVideoDevice: MediaDeviceInfo | null,
  shouldAskForAudio: boolean,
  audioConstraints: MediaTrackConstraints | undefined,
  previousAudioDevice: MediaDeviceInfo | null
): MediaStreamConstraints => ({
  video: shouldAskForVideo && {
    ...videoConstraints,
    deviceId: { exact: previousVideoDevice?.deviceId },
  },
  audio: shouldAskForAudio && {
    ...audioConstraints,
    deviceId: { exact: previousAudioDevice?.deviceId },
  },
});

const prepareConstraints = (
  shouldAskForDevice: boolean,
  deviceIdToStart: string | undefined,
  videoConstraints: MediaTrackConstraints | undefined
) => {
  if (!shouldAskForDevice) return false;

  return deviceIdToStart ? { ...videoConstraints, deviceId: { exact: deviceIdToStart } } : videoConstraints;
};

const getExactConstraintsIfPossible = (
  shouldAskForVideo: boolean,
  videoIdToStart: string | undefined,
  videoConstraints: MediaTrackConstraints | undefined,
  shouldAskForAudio: boolean,
  audioIdToStart: string | undefined,
  audioConstraints: MediaTrackConstraints | undefined
) => {
  log({
    shouldAskForVideo,
    videoIdToStart,
    videoConstraints,
    shouldAskForAudio,
    audioIdToStart,
    audioConstraints,
  });

  return {
    video: prepareConstraints(shouldAskForVideo, videoIdToStart, videoConstraints),
    audio: prepareConstraints(shouldAskForAudio, audioIdToStart, audioConstraints),
  };
};

const REQUESTING = { type: "Requesting" } as const;
const NOT_REQUESTED = { type: "Not requested" } as const;

type DeviceError = { name: "OverconstrainedError" } | { name: "NotAllowedError" };
const PERMISSION_DENIED: DeviceError = { name: "NotAllowedError" };
const OVERCONSTRAINED_ERROR: DeviceError = { name: "OverconstrainedError" };

// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#exceptions
// OverconstrainedError has higher priority than NotAllowedError
const parseError = (error: unknown): DeviceError | null => {
  if (error && typeof error === "object" && "name" in error) {
    if (error.name === "NotAllowedError") {
      return PERMISSION_DENIED;
    } else if (error.name === "OverconstrainedError") {
      return OVERCONSTRAINED_ERROR;
    }
  }
  // todo handle unknown error
  return null;
};

const enumerateDevices: () => Promise<MediaDeviceInfo[]> = async () => await navigator.mediaDevices.enumerateDevices();

// eslint-disable-next-line
const log = (message?: any, ...optionalParams: any[]) => {
  const logDeviceManager = localStorage.getItem("log-device-manager");
  if (logDeviceManager === "true") {
    console.log(message, ...optionalParams);
  }
};

// eslint-disable-next-line
const warn = (message?: any, ...optionalParams: any[]) => {
  const logDeviceManager = localStorage.getItem("log-device-manager");
  if (logDeviceManager === "true") {
    console.warn(message, optionalParams);
  }
};

type Errors = {
  audio?: DeviceError | null;
  video?: DeviceError | null;
};

type GetMedia =
  | { stream: MediaStream; type: "OK"; constraints: MediaStreamConstraints; previousErrors: Errors }
  | { error: DeviceError | null; type: "Error"; constraints: MediaStreamConstraints };

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

const removeExact = (
  trackConstraints: boolean | MediaTrackConstraints | undefined
): boolean | MediaTrackConstraints | undefined => {
  if (trackConstraints === undefined || trackConstraints === true || trackConstraints === false)
    return trackConstraints;
  const copy: MediaTrackConstraints = { ...trackConstraints };
  delete copy["deviceId"];
  return copy;
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

/**
 * Hook that returns the list of available devices
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
  const [state, setState] = useState<UseUserMediaState>({
    videoStatus: { type: "Not requested" },
    audioStatus: { type: "Not requested" },
    audioMedia: null,
    videoMedia: null,
    audioError: null,
    videoError: null,
    devices: null,
    audioDevices: null,
    videoDevices: null,
  });

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
      video: shouldAskForVideo && videoConstraints ? REQUESTING : prevState.videoStatus ?? NOT_REQUESTED,
      audio: shouldAskForAudio && audioConstraints ? REQUESTING : prevState.audioStatus ?? NOT_REQUESTED,
    }));

    let requestedDevices: MediaStream | null = null;

    const constraints = getExactConstraints(
      shouldAskForVideo,
      videoConstraints,
      previousVideoDevice,
      shouldAskForAudio,
      audioConstraints,
      previousAudioDevice
    );

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
      // We can switch randomly given device to one that has the same label as the one used in previous session.
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

          const exactConstraints: MediaStreamConstraints = getExactConstraintsIfPossible(
            !!result.constraints.video,
            videoIdToStart,
            videoConstraints,
            !!result.constraints.audio,
            audioIdToStart,
            audioConstraints
          );

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

    const videoDevices = mediaDeviceInfos.filter(isVideo);
    const videoTrack = requestedDevices?.getVideoTracks()[0] || null;
    const videoDeviceInfo = getDeviceInfo(videoTrack?.getSettings()?.deviceId || null, videoDevices);
    const videoError = getError(result, "video");

    const audioDevices = mediaDeviceInfos.filter(isAudio);
    const audioTrack = requestedDevices?.getAudioTracks()[0] || null;
    const audioDeviceInfo = getDeviceInfo(audioTrack?.getSettings()?.deviceId || null, audioDevices);
    const audioError = getError(result, "audio");

    setState({
      devices: mediaDeviceInfos,
      videoDevices: videoDevices,
      audioDevices: audioDevices,
      videoStatus: prepareStatus(shouldAskForVideo, videoTrack, videoError),
      audioStatus: prepareStatus(shouldAskForAudio, audioTrack, audioError),
      videoMedia: {
        stream: videoTrack ? requestedDevices : null,
        track: videoTrack,
        deviceInfo: videoDeviceInfo,
        enabled: !!videoTrack,
      },
      audioMedia: {
        stream: audioTrack ? requestedDevices : null,
        track: audioTrack,
        deviceInfo: audioDeviceInfo,
        enabled: !!audioTrack,
      },
      videoError: videoError,
      audioError: audioError,
    });

    if (videoDeviceInfo) {
      saveLastVideoDevice(videoDeviceInfo);
    }

    if (audioDeviceInfo) {
      saveLastAudioDevice(audioDeviceInfo);
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
      const shouldRestartVideo = !!videoDeviceId && videoDeviceId !== state.videoMedia?.deviceInfo?.deviceId;
      const shouldRestartAudio = !!audioDeviceId && audioDeviceId !== state.audioMedia?.deviceInfo?.deviceId;

      const exactConstraints: MediaStreamConstraints = {
        video: shouldRestartVideo && prepareMediaTrackConstraints(videoDeviceId, videoConstraints),
        audio: shouldRestartAudio && prepareMediaTrackConstraints(audioDeviceId, audioConstraints),
      };

      if (!exactConstraints.video && !exactConstraints.audio) return;

      const result = await getMedia(exactConstraints, {}, "Restart");

      if (result.type == "OK") {
        const stream = result.stream;

        if (shouldRestartVideo) {
          state?.videoMedia?.track?.stop();
        }

        if (shouldRestartAudio) {
          state?.audioMedia?.track?.stop();
        }

        const videoInfo = videoDeviceId ? getDeviceInfo(videoDeviceId, state.videoDevices ?? []) : null;
        if (videoInfo) {
          saveLastVideoDevice(videoInfo);
        }

        const audioInfo = audioDeviceId ? getDeviceInfo(audioDeviceId, state.audioDevices ?? []) : null;
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
            : prevState.videoMedia;

          const audioMedia: Media | null = shouldRestartAudio
            ? {
                stream,
                track: stream.getAudioTracks()[0] || null,
                deviceInfo: audioInfo,
                enabled: true,
              }
            : prevState.audioMedia;

          return { ...prevState, videoMedia, audioMedia };
        });
      } else {
        const parsedError = result.error;

        setState((prevState) => {
          const videoError = exactConstraints.video ? parsedError : prevState.videoError;
          const audioError = exactConstraints.audio ? parsedError : prevState.audioError;

          return { ...prevState, audioError, videoError };
        });
      }
    },
    [state, audioConstraints, saveLastAudioDevice, videoConstraints, saveLastVideoDevice]
  );

  const stop = useCallback(async (type: MediaType) => {
    const name = type === "audio" ? "audioMedia" : "videoMedia";

    setState((prevState) => {
      prevState?.[name]?.track?.stop();

      return { ...prevState, [name]: null };
    });
  }, []);

  const setEnable = useCallback((type: MediaType, value: boolean) => {
    setState((prevState) => {
      const name = type === "audio" ? "audioMedia" : "videoMedia";
      const media = prevState[name];
      if (!media || !media.track) {
        return prevState;
      }

      media.track.enabled = value;

      return { ...prevState, [name]: { ...prevState[name], enabled: value } };
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
