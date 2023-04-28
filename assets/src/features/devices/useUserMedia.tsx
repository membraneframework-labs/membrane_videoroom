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
) =>
  (currentDevices?.videoinput &&
    isDeviceDifferentFromLastSession(lastVideoDevice, currentDevices?.videoinput || null)) ||
  (currentDevices?.audioinput && isDeviceDifferentFromLastSession(lastAudioDevice, currentDevices?.audioinput || null));

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

const abc = (
  shouldAskForVideo: boolean,
  videoIdToStart: string | undefined,
  videoConstraints: MediaTrackConstraints | undefined
) => {
  if (shouldAskForVideo) {
    if (videoIdToStart) {
      return {
        ...videoConstraints,
        deviceId: { exact: videoIdToStart },
      };
    } else {
      return videoConstraints;
    }
  } else {
    return false;
  }
};

const getExactConstraintsIfPossible = (
  shouldAskForVideo: boolean,
  videoIdToStart: string | undefined,
  videoConstraints: MediaTrackConstraints | undefined,
  shouldAskForAudio: boolean,
  audioIdToStart: string | undefined,
  audioConstraints: MediaTrackConstraints | undefined
) => {
  console.log({
    shouldAskForVideo,
    videoIdToStart,
    videoConstraints,
    shouldAskForAudio,
    audioIdToStart,
    audioConstraints,
  });

  return {
    video: abc(shouldAskForVideo, videoIdToStart, videoConstraints),
    audio: abc(shouldAskForAudio, audioIdToStart, audioConstraints),
  };
};

const REQUESTING = { type: "Requesting" } as const;
const NOT_REQUESTED = { type: "Not requested" } as const;

const shouldAskForLastDevices = (
  previousVideoDevice: MediaDeviceInfo | null,
  previousAudioDevice: MediaDeviceInfo | null
) => previousVideoDevice?.deviceId || previousAudioDevice?.deviceId;

const shouldAskForAnyDevice = (requestedDevices: null | MediaStream) => requestedDevices === null;

type DeviceError =
  | {
      name: "OverconstrainedError";
      message: "";
      constraint: "deviceId";
    }
  | {
      message: "Permission denied";
      name: "NotAllowedError";
    };

const PERMISSION_DENIED: DeviceError = {
  message: "Permission denied",
  name: "NotAllowedError",
};

const OVERCONSTRAINED_ERROR: DeviceError = {
  name: "OverconstrainedError",
  message: "",
  constraint: "deviceId",
};

// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#exceptions
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
    console.log({ data: state });
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

    let shouldAskForVideo = userAskForVideo;
    let shouldAskForAudio = userAskFroAudio;

    setState((prevState) => ({
      ...prevState,
      audio: userAskForVideo && audioConstraints ? REQUESTING : prevState.audio ?? NOT_REQUESTED,
      video: userAskFroAudio && videoConstraints ? REQUESTING : prevState.video ?? NOT_REQUESTED,
    }));

    const enumeratedDevices = await navigator.mediaDevices.enumerateDevices();

    const isVideoAvailable = !enumeratedDevices
      .filter((d) => d.kind === "videoinput")
      .some((d) => d.deviceId === "" || d.label === "");

    const isAudioAvailable = !enumeratedDevices
      .filter((d) => d.kind === "audioinput")
      .some((d) => d.deviceId === "" || d.label === "");
    console.log({ enumeratedDevices, isVideoAvailable, isAudioAvailable });

    let requestedDevices: MediaStream | null = null;

    // todo change error
    let audioError: DeviceError | null = null;
    let videoError: DeviceError | null = null;

    console.log({ audioError, videoError });

    const phase1 = !!shouldAskForLastDevices(previousVideoDevice, previousAudioDevice);
    console.log(`%c 1. Exact constraints check (${phase1})`, "color: purple");
    if (phase1) {
      try {
        requestedDevices = await navigator.mediaDevices.getUserMedia(
          getExactConstraints(
            userAskForVideo,
            videoConstraints,
            previousVideoDevice,
            userAskFroAudio,
            audioConstraints,
            previousAudioDevice
          )
        );
        console.log("%c   1. Exact constraints succeeded", "color: green");
      } catch (error: unknown) {
        console.log("%c   1. Exact constraints failed", "color: orange");

        console.warn({ error });
        const parsedError = parseError(error);

        if (parsedError?.name === "NotAllowedError") {
          audioError = isAudioAvailable ? null : PERMISSION_DENIED;
          videoError = isVideoAvailable ? null : PERMISSION_DENIED;
        } else if (parsedError?.name === "OverconstrainedError") {
          // OverconstrainedError has higher priority than NotAllowedError
          // swallow this error and handle it in phase 2
        }
      }

      /* This error could be ignored because it will be another attempt */
    }

    shouldAskForVideo = userAskForVideo && videoError?.name !== "NotAllowedError";
    shouldAskForAudio = userAskFroAudio && audioError?.name !== "NotAllowedError";

    // Proba poluźnienia uprawnień
    // urządzenia z not allowd są wykluczone, to dalej robimy

    // if "NotAllowed" ->
    //    stop asking about this device

    console.log({ audioError, videoError });

    const phase2 = (shouldAskForVideo || shouldAskForAudio) && shouldAskForAnyDevice(requestedDevices);
    console.log(`%c 2. Additional exact constraints check: (${phase2})`, "color: purple");
    if (phase2) {
      try {
        const exactConstraints2 = getExactConstraints(
          shouldAskForVideo,
          videoConstraints,
          previousVideoDevice,
          shouldAskForAudio,
          audioConstraints,
          previousAudioDevice
        );

        // console.log({ exactConstraints2 });

        requestedDevices = await navigator.mediaDevices.getUserMedia(exactConstraints2);
        console.log("%c   2. Additional exact constraints succeeded", "color: green");
      } catch (error: unknown) {
        console.log("%c   2. Additional exact failed", "color: orange");

        console.warn({ error });
        const parsedError = parseError(error);

        if (parsedError?.name === "NotAllowedError") {
          // There shouldn't be this error.
          console.error("There shouldn't be this error!!!");
          throw Error("There shouldn't be this error");
          // audioError = isAudioAvailable ? null : PERMISSION_DENIED;
          // videoError = isVideoAvailable ? null : PERMISSION_DENIED;
        } else if (parsedError?.name === "OverconstrainedError") {
          audioError = shouldAskForAudio ? OVERCONSTRAINED_ERROR : audioError;
          videoError = shouldAskForVideo ? OVERCONSTRAINED_ERROR : videoError;
        }
      }

      /* This error could be ignored because it will be another attempt */
    }

    // Jeżeli jest not allowed to nie ma overconstraint
    // obsłuż not allowed

    // if "OverconstrainedError" -> means "OverconstrainedError" or "OverconstrainedError" and "Not allowed"
    //    lose constraint

    console.log({ audioError, videoError });

    try {
      // If NotAllowedError and OverconstrainedError can be thrown OverconstrainedError has higher priority
      // so OverconstrainedError will be thrown. (based on my tests, google chrome)
      //
      // It will lose constrains for ids for BOTH devices to overcome OverconstrainedError (we c)
      // and if NotAllowedError was thrown, it will stop asking about this device.
      //
      // BOTH errors -> handle OverconstrainedError and ask for BOTH devices with weaker constraints -> could resolve to NotAllowedError or OK
      // OverconstrainedError -> handle OverconstrainedError and ask for BOTH devices with weaker constraints ->
      // NotAllowedError -> ask for another device ->
      //
      // If only NotAllowedError is possible this block of code will skip that device and ask only for second device.
      // If only OverconstrainedError is possible it will lose constraints for ids. So OverconstrainedError won't be possible.
      //
      // If overconstrained error was thrown in 1 phase it will handle it.
      // If not allowed error was thrown this would skip that device
      // Overconstrained error has higher priority than NotAllowedError so this will once again handle NotAllowedError
      const phase3 = shouldAskForAnyDevice(requestedDevices);
      console.log(`%c 3. Any constraints check (${phase3})`, "color: purple");
      if (phase3) {
        console.log({ audioError, videoError });

        // const anyDeviceOldConstraints: MediaStreamConstraints = {
        //   video: userAskForVideo && videoConstraints,
        //   audio: userAskFroAudio && audioConstraints,
        // };
        //
        // console.log({ anyDeviceOldConstraints });
        const anyDeviceConstraints: MediaStreamConstraints = {
          video: shouldAskForVideo && videoConstraints,
          audio: shouldAskForAudio && audioConstraints,
        };

        console.log({ anyDeviceConstraints });

        requestedDevices = await navigator.mediaDevices.getUserMedia(anyDeviceConstraints);
        console.log("%c   3. Any constraints succeeded", "color: green");
      }
    } catch (error: unknown) {
      console.log("%c   3. Any constraints failed", "color: orange");

      console.warn({ error });
      const parsedError = parseError(error);
      // tutaj jużo overconstraint nie poleci

      videoError = userAskForVideo && !isVideoAvailable ? parsedError : videoError;
      audioError = userAskFroAudio && !isAudioAvailable ? parsedError : audioError;
    }

    // // * Additional run start * //
    // try {
    //   console.log("%c 3. Additional any constraints check", "color: purple");
    //   if (shouldAskForAnyDevice(requestedDevices)) {
    //     // console.warn({ audioError, videoError });
    //
    //     shouldAskForVideo = userAskForVideo && videoError?.name !== "NotAllowedError";
    //     shouldAskForAudio = userAskFroAudio && audioError?.name !== "NotAllowedError";
    //
    //     // // console.log({ anyDeviceOldConstraints });
    //     const anyDeviceConstraints: MediaStreamConstraints = {
    //       video: shouldAskForVideo && videoConstraints,
    //       audio: shouldAskForAudio && audioConstraints,
    //     };
    //     //
    //     console.log({ anyDeviceConstraints });
    //     //
    //     requestedDevices = await navigator.mediaDevices.getUserMedia(anyDeviceConstraints);
    //     console.log("%c   3. Additional any constraints succeeded", "color: green");
    //   }
    // } catch (error: unknown) {
    //   console.log("%c   3. Additional any constraints failed", "color: orange");
    //
    //   console.warn({ error });
    //   const parsedError = parseError(error);
    //   // // tutaj jużo overconstraint nie poleci
    //   //
    //   // videoError = userAskForVideo && !isVideoAvailable ? parsedError : videoError;
    //   // audioError = userAskFroAudio && !isAudioAvailable ? parsedError : audioError;
    // }
    // // * Additional run end * //

    const mediaDeviceInfos: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();

    // Safari changes deviceId between sessions, therefore we cannot rely on it for identification purposes.
    // We can switch randomly given device to one that has the same label as the one used in previous session.
    if (requestedDevices) {
      try {
        const currentDevices = getCurrentDevicesSettings(requestedDevices, mediaDeviceInfos);

        // console.log({ currentDevices });
        const phase4 = !!isAnyDeviceDifferentFromLastSession(previousVideoDevice, previousAudioDevice, currentDevices);
        console.log(`%c 4. Device correction check (${phase4})`, "color: purple");
        if (phase4) {
          const videoIdToStart = mediaDeviceInfos.find((info) => info.label === previousVideoDevice?.label)?.deviceId;
          const audioIdToStart = mediaDeviceInfos.find((info) => info.label === previousAudioDevice?.label)?.deviceId;

          if (videoIdToStart || audioIdToStart) {
            stopTracks(requestedDevices);

            const exactConstraints: MediaStreamConstraints = getExactConstraintsIfPossible(
              shouldAskForVideo, // shouldAskForVideo
              videoIdToStart,
              videoConstraints,
              shouldAskForAudio, // shouldAskForAudio
              audioIdToStart,
              audioConstraints
            );

            // console.log({ exactConstraints });

            requestedDevices = await navigator.mediaDevices.getUserMedia(exactConstraints);

            console.log("%c   4. Device correction succeeded", "color: green");
          }
        }
      } catch (error: unknown) {
        console.log("%c   4. Device correction failed", "color: orange");
        console.warn({ error });

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
      video: prepareReturn(userAskForVideo, videoDevices, videoError),
      audio: prepareReturn(userAskFroAudio, audioDevices, audioError),
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
