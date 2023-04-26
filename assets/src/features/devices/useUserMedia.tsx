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
  audioError: string | null;
  videoError: string | null;
};

const prepareReturn = (
  isInterested: boolean,
  mediaDeviceInfo: MediaDeviceInfo[],
  permissionError: string | null
): DeviceReturnType => {
  if (!isInterested) return { type: "Not requested" };
  if (permissionError) return { type: "Error", name: permissionError };
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

const isDeviceDifferentFromLastSession = (lastDevice: MediaDeviceInfo | null, currentDevices: MediaDeviceInfo | null) =>
  (lastDevice && currentDevices?.deviceId !== lastDevice.deviceId) || currentDevices?.label === lastDevice?.label;

const isAnyDeviceDifferentFromLastSession = (
  lastVideoDevice: MediaDeviceInfo | null,
  lastAudioDevice: MediaDeviceInfo | null,
  currentDevices: CurrentDevices | null
) =>
  isDeviceDifferentFromLastSession(lastVideoDevice, currentDevices?.videoinput || null) ||
  isDeviceDifferentFromLastSession(lastAudioDevice, currentDevices?.audioinput || null);

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

const getExactConstraintsIfPossible = (
  shouldAskForVideo: boolean,
  videoIdToStart: string | undefined,
  videoConstraints: MediaTrackConstraints | undefined,
  shouldAskForAudio: boolean,
  audioIdToStart: string | undefined,
  audioConstraints: MediaTrackConstraints | undefined
) => ({
  video:
    shouldAskForVideo && !!videoIdToStart
      ? {
          ...videoConstraints,
          deviceId: { exact: videoIdToStart },
        }
      : videoConstraints,
  audio:
    shouldAskForAudio && !!audioIdToStart
      ? {
          ...audioConstraints,
          deviceId: { exact: audioIdToStart },
        }
      : audioConstraints,
});

const REQUESTING = { type: "Requesting" } as const;
const NOT_REQUESTED = { type: "Not requested" } as const;

const shouldAskForLastDevices = (
  previousVideoDevice: MediaDeviceInfo | null,
  previousAudioDevice: MediaDeviceInfo | null
) => previousVideoDevice?.deviceId || previousAudioDevice?.deviceId;

const shouldAskForAnyDevice = (requestedDevices: null | MediaStream) => requestedDevices === null;

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

  const audioConstraints = useMemo(() => toMediaTrackConstraints(audioTrackConstraints), [audioTrackConstraints]);
  const videoConstraints = useMemo(() => toMediaTrackConstraints(videoTrackConstraints), [videoTrackConstraints]);

  const skip = useRef<boolean>(false);

  const init = useCallback(async () => {
    if (!navigator?.mediaDevices) throw Error("Navigator is available only in secure contexts");
    if (skip.current) return;
    skip.current = true;

    const previousVideoDevice: MediaDeviceInfo | null = getLastVideoDevice();
    const previousAudioDevice: MediaDeviceInfo | null = getLastAudioDevice();

    const shouldAskForAudio = !!audioTrackConstraints;
    const shouldAskForVideo = !!videoTrackConstraints;

    setState((prevState) => ({
      ...prevState,
      audio: shouldAskForVideo && audioConstraints ? REQUESTING : prevState.audio ?? NOT_REQUESTED,
      video: shouldAskForAudio && videoConstraints ? REQUESTING : prevState.video ?? NOT_REQUESTED,
    }));

    let requestedDevices: MediaStream | null = null;

    if (shouldAskForLastDevices(previousVideoDevice, previousAudioDevice)) {
      try {
        requestedDevices = await navigator.mediaDevices.getUserMedia(
          getExactConstraints(
            shouldAskForVideo,
            videoConstraints,
            previousVideoDevice,
            shouldAskForAudio,
            audioConstraints,
            previousAudioDevice
          )
        );
      } catch (_: unknown) {
        /* This error could be ignored because it will be another attempt */
      }
    }

    let audioError: string | null = null;
    let videoError: string | null = null;

    try {
      if (shouldAskForAnyDevice(requestedDevices)) {
        const anyDeviceConstraints: MediaStreamConstraints = {
          video: shouldAskForVideo && videoConstraints,
          audio: shouldAskForAudio && audioConstraints,
        };

        requestedDevices = await navigator.mediaDevices.getUserMedia(anyDeviceConstraints);
      }
    } catch (error: unknown) {
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#exceptions
      const errorName = getName(error);
      videoError = shouldAskForVideo ? errorName : null;
      audioError = shouldAskForAudio ? errorName : null;
    }

    const mediaDeviceInfos: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();

    // Safari changes deviceId between sessions, therefore we cannot rely on it for identification purposes.
    // We can switch randomly given device to one that has the same label as the one used in previous session.
    if (requestedDevices) {
      try {
        const currentDevices = getCurrentDevicesSettings(requestedDevices, mediaDeviceInfos);

        if (isAnyDeviceDifferentFromLastSession(previousVideoDevice, previousAudioDevice, currentDevices)) {
          const videoIdToStart = mediaDeviceInfos.find((info) => info.label === previousVideoDevice?.label)?.deviceId;
          const audioIdToStart = mediaDeviceInfos.find((info) => info.label === previousAudioDevice?.label)?.deviceId;

          if (videoIdToStart || audioIdToStart) {
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
          }
        }
      } catch (error: unknown) {
        /* This error could be ignored because we handle navigator errors in previous try catch */
      }
    }

    const videoDevices = mediaDeviceInfos.filter(isVideo);
    const videoTrack = requestedDevices?.getVideoTracks()[0] || null;
    const videoDeviceInfo = getDeviceInfo(videoTrack?.getSettings()?.deviceId || null, videoDevices);

    const audioDevices = mediaDeviceInfos.filter(isAudio);
    const audioTrack = requestedDevices?.getAudioTracks()[0] || null;
    const audioDeviceInfo = getDeviceInfo(audioTrack?.getSettings()?.deviceId || null, audioDevices);

    setState({
      video: prepareReturn(shouldAskForVideo, videoDevices, videoError),
      audio: prepareReturn(shouldAskForAudio, audioDevices, audioError),
      audioMedia: {
        stream: requestedDevices,
        track: audioTrack,
        deviceInfo: audioDeviceInfo,
        enabled: !!audioTrack,
      },
      videoMedia: {
        stream: requestedDevices,
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
        const errorName = getName(error);

        setState((prevState) => {
          const videoError = exactConstraints.video ? errorName : prevState.videoError;
          const audioError = exactConstraints.audio ? errorName : prevState.audioError;

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
      if (!prevState[name]) {
        return prevState;
      }
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
