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

export const getName = (obj: unknown): string | null =>
  obj && typeof obj === "object" && "name" in obj && typeof obj.name === "string" ? obj["name"] : null;

export type MediaType = "audio" | "video";

export type DeviceReturnType =
  | { type: "OK"; devices: MediaDeviceInfo[] }
  | { type: "Error"; name: string | null }
  | { type: "Not requested" };

export type Media = {
  stream: MediaStream | null;
  track: MediaStreamTrack | null;
  enabled: boolean;
  deviceInfo: MediaDeviceInfo | null;
};

export type UseUserMediaState = {
  audio: DeviceReturnType | { type: "Requesting" };
  video: DeviceReturnType | { type: "Requesting" };
  audioMedia: Media | null;
  videoMedia: Media | null;
  audioError: DeviceError | null;
  videoError: DeviceError | null;
};

const prepareReturn = (
  isInterested: boolean,
  mediaDeviceInfo: MediaDeviceInfo[],
  permissionError: DeviceError | null
): DeviceReturnType => {
  if (!isInterested) return { type: "Not requested" };
  if (permissionError) return { type: "Error", name: permissionError.name };
  return {
    type: "OK",
    devices: mediaDeviceInfo.filter(isGranted),
  };
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

const getIdealConstraints = (
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

const shouldAskForLastDevices = (
  previousVideoDevice: MediaDeviceInfo | null,
  previousAudioDevice: MediaDeviceInfo | null
): boolean => !!(previousVideoDevice?.deviceId || previousAudioDevice?.deviceId);

const shouldAskForAnyDevice = (requestedDevices: null | MediaStream) => requestedDevices === null;

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

const enumerateUniqueDevices = async () =>
  (await navigator.mediaDevices.enumerateDevices())
    // Chrome adds copy of exising device with deviceId "default" and with additional prefix in label: "Default - Build In Camera"
    .filter(({ deviceId }) => deviceId !== "default");

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
    video: { type: "Not requested" },
    audio: { type: "Not requested" },
    audioMedia: null,
    videoMedia: null,
    audioError: null,
    videoError: null,
  });

  useEffect(() => {
    log({ data: state });
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

    const userAskFroAudio = !!audioTrackConstraints;
    const userAskForVideo = !!videoTrackConstraints;

    // todo remove usage of userAskForVideo and userAskFroAudio
    // By using this 2 variables (shouldAskForVideo and shouldAskForAudio)
    // we can skip a device that is currently blocked ("NotAllowedError") and ask only for remaining one
    let shouldAskForVideo = userAskForVideo;
    let shouldAskForAudio = userAskFroAudio;

    setState((prevState) => ({
      ...prevState,
      audio: userAskForVideo && audioConstraints ? REQUESTING : prevState.audio ?? NOT_REQUESTED,
      video: userAskFroAudio && videoConstraints ? REQUESTING : prevState.video ?? NOT_REQUESTED,
    }));
    const enumeratedDevices = await enumerateUniqueDevices();
    log({ enumeratedDevices });

    const isVideoAvailable = !enumeratedDevices
      .filter((d) => d.kind === "videoinput")
      .some((d) => d.deviceId === "" || d.label === "");

    const isAudioAvailable = !enumeratedDevices
      .filter((d) => d.kind === "audioinput")
      .some((d) => d.deviceId === "" || d.label === "");

    let requestedDevices: MediaStream | null = null;

    let audioError: DeviceError | null = null;
    let videoError: DeviceError | null = null;

    log({ audioError, videoError });

    const shouldAskForExactDevice = shouldAskForLastDevices(previousVideoDevice, previousAudioDevice);
    log(`%c 1. Exact constraints check (${shouldAskForExactDevice})`, "color: purple");

    if (shouldAskForExactDevice) {
      try {
        const constraints = getIdealConstraints(
          userAskForVideo,
          videoConstraints,
          previousVideoDevice,
          userAskFroAudio,
          audioConstraints,
          previousAudioDevice
        );
        log({ constraints });

        requestedDevices = await navigator.mediaDevices.getUserMedia(constraints);
        log("%c   1. Exact constraints succeeded", "color: green");
      } catch (error: unknown) {
        warn({ error });
        const parsedError = parseError(error);

        audioError = isAudioAvailable ? null : parsedError;
        videoError = isVideoAvailable ? null : parsedError;
      }
    }

    log({ audioError, videoError });

    shouldAskForVideo = userAskForVideo && videoError?.name !== "NotAllowedError";
    shouldAskForAudio = userAskFroAudio && audioError?.name !== "NotAllowedError";

    log({ shouldAskForVideo, shouldAskForAudio });

    const shouldAskForExactDevicesWithoutBlocked =
      (shouldAskForVideo || shouldAskForAudio) && shouldAskForAnyDevice(requestedDevices);
    log(`%c 2. Additional exact constraints check: (${shouldAskForExactDevicesWithoutBlocked})`, "color: purple");

    if (shouldAskForExactDevicesWithoutBlocked) {
      try {
        const constraints = getIdealConstraints(
          shouldAskForVideo,
          videoConstraints,
          previousVideoDevice,
          shouldAskForAudio,
          audioConstraints,
          previousAudioDevice
        );
        log({ constraints });

        requestedDevices = await navigator.mediaDevices.getUserMedia(constraints);
        log("%c   2. Additional exact constraints succeeded", "color: green");
        audioError = shouldAskForAudio ? null : audioError;
        videoError = shouldAskForVideo ? null : videoError;
      } catch (error: unknown) {
        warn({ error });
        const parsedError = parseError(error);

        audioError = shouldAskForAudio ? parsedError : audioError;
        videoError = shouldAskForVideo ? parsedError : videoError;
      }
    }

    const shouldAskForAnyDevice2 = shouldAskForAnyDevice(requestedDevices) && (shouldAskForVideo || shouldAskForAudio);
    log(`%c 3. Any constraints check (${shouldAskForAnyDevice2})`, "color: purple");
    log({ shouldAskForVideo, shouldAskForAudio });

    if (shouldAskForAnyDevice2) {
      try {
        const anyDeviceConstraints: MediaStreamConstraints = {
          video: shouldAskForVideo && videoConstraints,
          audio: shouldAskForAudio && audioConstraints,
        };

        log({ anyDeviceConstraints });

        requestedDevices = await navigator.mediaDevices.getUserMedia(anyDeviceConstraints);
        log("%c   3. Any constraints succeeded", "color: green");
        audioError = shouldAskForAudio ? null : audioError;
        videoError = shouldAskForVideo ? null : videoError;
      } catch (error: unknown) {
        log("%c   3. Any constraints failed", "color: orange");

        warn({ error });
        const parsedError = parseError(error);
        warn({ parsedError });

        videoError = userAskForVideo && !isVideoAvailable ? parsedError : videoError;
        audioError = userAskFroAudio && !isAudioAvailable ? parsedError : audioError;
      }
    }

    shouldAskForAudio = shouldAskForAudio && audioError?.name !== "NotAllowedError";
    shouldAskForVideo = shouldAskForVideo && videoError?.name !== "NotAllowedError";

    const askForAnyDevicesWithoutBlocked =
      shouldAskForAnyDevice(requestedDevices) && (shouldAskForVideo || shouldAskForAudio);
    log(`%c 4. Any constraints check 2 (${askForAnyDevicesWithoutBlocked})`, "color: purple");
    if (askForAnyDevicesWithoutBlocked) {
      try {
        const anyDeviceConstraints: MediaStreamConstraints = {
          video: shouldAskForVideo && videoConstraints,
          audio: shouldAskForAudio && audioConstraints,
        };

        log({ anyDeviceConstraints });

        requestedDevices = await navigator.mediaDevices.getUserMedia(anyDeviceConstraints);
        log("%c   4. Any constraints succeeded", "color: green");

        videoError = shouldAskForVideo ? null : videoError;
        audioError = shouldAskForAudio ? null : audioError;
      } catch (error: unknown) {
        warn({ error });
        const parsedError = parseError(error);

        videoError = userAskForVideo && !isVideoAvailable ? parsedError : videoError;
        audioError = userAskFroAudio && !isAudioAvailable ? parsedError : audioError;
      }
    }

    const mediaDeviceInfos: MediaDeviceInfo[] = await enumerateUniqueDevices();

    // Safari changes deviceId between sessions, therefore we cannot rely on deviceId for identification purposes.
    // We can switch randomly given device to one that has the same label as the one used in previous session.
    if (requestedDevices) {
      const currentDevices = getCurrentDevicesSettings(requestedDevices, mediaDeviceInfos);
      const shouldCorrectDevices = isAnyDeviceDifferentFromLastSession(
        previousVideoDevice,
        previousAudioDevice,
        currentDevices
      );
      log(`%c 5. Device correction check (${shouldCorrectDevices})`, "color: purple");
      if (shouldCorrectDevices) {
        const videoIdToStart = mediaDeviceInfos.find((info) => info.label === previousVideoDevice?.label)?.deviceId;
        const audioIdToStart = mediaDeviceInfos.find((info) => info.label === previousAudioDevice?.label)?.deviceId;

        if (videoIdToStart || audioIdToStart) {
          try {
            stopTracks(requestedDevices);

            const exactConstraints: MediaStreamConstraints = getExactConstraintsIfPossible(
              shouldAskForVideo,
              videoIdToStart,
              videoConstraints,
              shouldAskForAudio,
              audioIdToStart,
              audioConstraints
            );

            requestedDevices = await navigator.mediaDevices.getUserMedia(exactConstraints);

            videoError = shouldAskForVideo ? null : videoError;
            audioError = shouldAskForAudio ? null : audioError;
            log("%c   5. Device correction succeeded", "color: green");
          } catch (error: unknown) {
            warn({ error });
            /* This error could be ignored because we handle navigator errors in previous try catch */
          }
        }
      }
    }

    const videoDevices = mediaDeviceInfos.filter(isVideo);
    const videoTrack = requestedDevices?.getVideoTracks()[0] || null;
    const videoDeviceInfo = getDeviceInfo(videoTrack?.getSettings()?.deviceId || null, videoDevices);

    const audioDevices = mediaDeviceInfos.filter(isAudio);
    const audioTrack = requestedDevices?.getAudioTracks()[0] || null;
    const audioDeviceInfo = getDeviceInfo(audioTrack?.getSettings()?.deviceId || null, audioDevices);

    setState({
      video: prepareReturn(userAskForVideo, videoDevices, videoError),
      audio: prepareReturn(userAskFroAudio, audioDevices, audioError),
      audioMedia: {
        stream: audioTrack ? requestedDevices : null,
        track: audioTrack,
        deviceInfo: audioDeviceInfo,
        enabled: !!audioTrack,
      },
      videoMedia: {
        stream: videoTrack ? requestedDevices : null,
        track: videoTrack,
        deviceInfo: videoDeviceInfo,
        enabled: !!videoTrack,
      },
      videoError: videoError,
      audioError: audioError,
    });

    if (audioDeviceInfo) {
      saveLastAudioDevice(audioDeviceInfo);
    }

    if (videoDeviceInfo) {
      saveLastVideoDevice(videoDeviceInfo);
    }
  }, [
    getLastVideoDevice,
    getLastAudioDevice,
    audioTrackConstraints,
    videoTrackConstraints,
    audioConstraints,
    videoConstraints,
    saveLastAudioDevice,
    saveLastVideoDevice,
  ]);

  const start = useCallback(
    async ({ audioDeviceId, videoDeviceId }: UseUserMediaStartConfig) => {
      const shouldRestartVideo = !!videoDeviceId && videoDeviceId !== state.videoMedia?.deviceInfo?.deviceId;
      const shouldRestartAudio = !!audioDeviceId && audioDeviceId !== state.audioMedia?.deviceInfo?.deviceId;

      const exactConstraints: MediaStreamConstraints = {
        video: shouldRestartVideo && prepareMediaTrackConstraints(videoDeviceId, videoConstraints),
        audio: shouldRestartAudio && prepareMediaTrackConstraints(audioDeviceId, audioConstraints),
      };

      if (!exactConstraints.audio && !exactConstraints.video) return;

      if (shouldRestartAudio) {
        state?.audioMedia?.track?.stop();
      }

      if (shouldRestartVideo) {
        state?.videoMedia?.track?.stop();
      }

      try {
        const requestedDevices = await navigator.mediaDevices.getUserMedia(exactConstraints);

        const audioDevices = state.audio.type === "OK" ? state.audio.devices : [];
        const audioInfo = audioDeviceId ? getDeviceInfo(audioDeviceId, audioDevices) : null;

        if (audioInfo) {
          saveLastAudioDevice(audioInfo);
        }

        const videoDevices = state.video.type === "OK" ? state.video.devices : [];
        const videoInfo = videoDeviceId ? getDeviceInfo(videoDeviceId, videoDevices) : null;

        if (videoInfo) {
          saveLastVideoDevice(videoInfo);
        }

        setState((prevState): UseUserMediaState => {
          const videoMedia: Media | null = shouldRestartVideo
            ? {
                stream: requestedDevices,
                track: requestedDevices.getVideoTracks()[0] || null,
                deviceInfo: videoInfo,
                enabled: true,
              }
            : prevState.videoMedia;

          const audioMedia: Media | null = shouldRestartAudio
            ? {
                stream: requestedDevices,
                track: requestedDevices.getAudioTracks()[0] || null,
                deviceInfo: audioInfo,
                enabled: true,
              }
            : prevState.audioMedia;

          return { ...prevState, audioMedia, videoMedia };
        });
      } catch (error: unknown) {
        const parsedError = parseError(error);

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
