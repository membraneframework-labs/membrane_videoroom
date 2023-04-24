import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

export type DeviceReturnType =
  | { type: "OK"; devices: MediaDeviceInfo[] }
  | { type: "Error"; name: string | null }
  | { type: "Not requested" };

export type Media = {
  stream: MediaStream | null;
  track: MediaStreamTrack | null;
};

export type UseUserMediaState = {
  audio: DeviceReturnType | { type: "Requesting" };
  video: DeviceReturnType | { type: "Requesting" };
  audioMedia: Media | null;
  videoMedia: Media | null;
};

export const prepareReturn = (
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
  getPreviousVideoDevice: () => MediaDeviceInfo | null,
  getPreviousAudioDevice: () => MediaDeviceInfo | null,
  videoTrackConstraints: boolean | MediaTrackConstraints,
  audioTrackConstraints: boolean | MediaTrackConstraints,
  refetchOnMount: boolean,
}

export type UseUserMediaStartConfig = {
  audioDeviceId?: string,
  videoDeviceId?: string,
}

export type UseUserMedia = {
  data: UseUserMediaState | null,
  start: (config: UseUserMediaStartConfig) => void,
  stop: (type: "video" | "audio") => void,
  init: (videoParam: boolean | MediaTrackConstraints, audioParam: boolean | MediaTrackConstraints) => void,
}

const prepareMediaTrackConstraints = (deviceId: string | undefined, constraints: MediaTrackConstraints | undefined): MediaTrackConstraints | boolean => {
  if (!deviceId) return false;
  const exactId: Pick<MediaTrackConstraints, "deviceId"> = deviceId ? { deviceId: { exact: deviceId } } : {}
  return { ...constraints, ...exactId }
}


/**
 * Hook that returns the list of available devices
 *
 * @param video - boolean or MediaTrackConstraints with configuration for video device
 * @param audio - boolean or MediaTrackConstraints with configuration for audio device
 * @returns object containing devices or loading state
 */
export const useUserMedia = (
  {
    getPreviousVideoDevice,
    getPreviousAudioDevice,
    videoTrackConstraints,
    audioTrackConstraints,
    refetchOnMount
  }: UseUserMediaConfig): UseUserMedia => {
  const [state, setState] = useState<UseUserMediaState>({
    video: { type: "Not requested" },
    audio: { type: "Not requested" },
    audioMedia: null,
    videoMedia: null
  });

  const audioConstraints = useMemo(() => toMediaTrackConstraints(audioTrackConstraints), [audioTrackConstraints])
  const videoConstraints = useMemo(() => toMediaTrackConstraints(videoTrackConstraints), [videoTrackConstraints])

  const skip = useRef<boolean>(false);

  const init = useCallback(
    async () => {
      if (!navigator?.mediaDevices) throw Error("Navigator is available only in secure contexts");
      if (skip.current) return;
      skip.current = true;

      const previousVideoDevice = getPreviousVideoDevice()
      const previousAudioDevice = getPreviousAudioDevice()

      const booleanAudio = !!audioTrackConstraints;
      const booleanVideo = !!videoTrackConstraints;

      setState((prevState) => ({
        audio: booleanVideo && audioConstraints ? { type: "Requesting" } : prevState.audio ?? { type: "Not requested" },
        video: booleanAudio && videoConstraints ? { type: "Requesting" } : prevState.video ?? { type: "Not requested" },
        audioMedia: null,
        videoMedia: null,
      }));

      let requestedDevices: MediaStream | null = null;

      if (previousVideoDevice?.deviceId || previousAudioDevice?.deviceId) {
        console.log("-> Jest device w local storage. Proszę o konkretne urządzenie");
        try {
          const exactConstraints: MediaStreamConstraints = {
            video: booleanVideo && {
              ...videoConstraints,
              deviceId: { exact: previousVideoDevice?.deviceId }
            },
            audio: booleanAudio && {
              ...audioConstraints,
              deviceId: { exact: previousAudioDevice?.deviceId }
            },
          };

          console.log({ exactConstraints });

          requestedDevices = await navigator.mediaDevices.getUserMedia(exactConstraints);
        } catch (error: unknown) {
          console.log("-> Nie udało się pobrać użądzenia po ID");
        }
      }

      let audioError: string | null = null;
      let videoError: string | null = null;

      try {
        if (requestedDevices === null) {
          console.log("-> Pobieram dowolne urządzenie");
          const anyDeviceConstraints: MediaStreamConstraints = {
            video: booleanVideo && videoConstraints,
            audio: booleanAudio && audioConstraints,
          };
          console.log({ anyDeviceConstraints });

          requestedDevices = await navigator.mediaDevices.getUserMedia(anyDeviceConstraints);
          console.log("-> Pobrano dowolne urządzenie");
        }
      } catch (error: unknown) {
        console.warn("Wystąpił błąd pobierania urządzeń");
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#exceptions
        const errorName = getName(error);
        videoError = booleanVideo ? errorName : null;
        audioError = booleanAudio ? errorName : null;
      }

      const mediaDeviceInfos: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();

      const currentDevices: { videoinput: MediaDeviceInfo | null; audioinput: MediaDeviceInfo | null } = {
        videoinput: null,
        audioinput: null,
      };

      try {
        if (requestedDevices) {
          requestedDevices.getTracks().forEach((track) => {
            const settings = track.getSettings();
            console.log({ settings });
            if (settings.deviceId) {
              const currentDevice = mediaDeviceInfos.find((device) => device.deviceId == settings.deviceId);
              const kind = currentDevice?.kind || null;
              if ((currentDevice && kind && kind === "videoinput") || kind === "audioinput") {
                currentDevices[kind] = currentDevice || null;
              }
            }
          });

          if (
            (previousVideoDevice && currentDevices.videoinput?.deviceId !== previousVideoDevice.deviceId) ||
            currentDevices.videoinput?.label === previousVideoDevice?.label
          ) {
            console.log(
              "-> Pobrane urządzenie nie odpowiada ostatnio używanemu. Szukam pasującego urządzenia po label"
            );
            // eg. Safari

            const videoIdToStart = mediaDeviceInfos.find((info) => info.label === previousVideoDevice?.label)?.deviceId;
            const audioIdToStart = mediaDeviceInfos.find((info) => info.label === previousAudioDevice?.label)?.deviceId;

            if (videoIdToStart || audioIdToStart) {
              console.log("-> Znalazłem pasujące. Wyłączam wszystko");
              requestedDevices.getTracks().forEach((track) => {
                track.stop();
              });

              const exactConstraints: MediaStreamConstraints = {
                video:
                  booleanVideo && !!videoIdToStart ? {
                    ...videoConstraints,
                    deviceId: { exact: videoIdToStart }
                  } : videoConstraints,
                audio:
                  booleanAudio && !!audioIdToStart ? {
                    ...audioConstraints,
                    deviceId: { exact: audioIdToStart }
                  } : audioConstraints,
              };

              console.log("-> Ponownie pobieram urządzenia");
              console.log({ exactConstraints });
              requestedDevices = await navigator.mediaDevices.getUserMedia(exactConstraints);
            }
          }
        }
      } catch (error: unknown) {
        console.error("-> To sięn powinno wydarzyć");
      }

      const videoDevices = mediaDeviceInfos.filter(isVideo);
      const audioDevices = mediaDeviceInfos.filter(isAudio);

      const videoTrack = requestedDevices?.getVideoTracks()[0] || null;
      const audioTrack = requestedDevices?.getAudioTracks()[0] || null;

      setState({
        video: prepareReturn(booleanVideo, videoDevices, videoError),
        audio: prepareReturn(booleanAudio, audioDevices, audioError),
        audioMedia: {
          stream: requestedDevices,
          track: audioTrack,
        },
        videoMedia: {
          stream: requestedDevices,
          track: videoTrack,
        },
      });
    },
    [audioTrackConstraints, audioConstraints, getPreviousAudioDevice, getPreviousVideoDevice, videoTrackConstraints, videoConstraints]
  );

  const start = useCallback(
    async ({ audioDeviceId, videoDeviceId }: UseUserMediaStartConfig) => {
      if (audioDeviceId) {
        state?.audioMedia?.track?.stop()
      }
      if (videoDeviceId) {
        state?.videoMedia?.track?.stop()
      }

      const exactConstraints: MediaStreamConstraints = {
        video: prepareMediaTrackConstraints(videoDeviceId, videoConstraints),
        audio: prepareMediaTrackConstraints(audioDeviceId, audioConstraints),
      };

      console.log("-> Pobieram nowe urządzenie");
      // todo add try catch
      const requestedDevices = await navigator.mediaDevices.getUserMedia(exactConstraints);

      const audioMedia: Pick<UseUserMediaState, "audioMedia"> | Record<string, never> = audioDeviceId ? {
        audioMedia: {
          stream: requestedDevices,
          track: requestedDevices.getAudioTracks()[0] || null,
        },
      } : {}

      const videoMedia: Pick<UseUserMediaState, "videoMedia"> | Record<string, never> = videoDeviceId ? {
        videoMedia: {
          stream: requestedDevices,
          track: requestedDevices.getAudioTracks()[0] || null,
        },
      } : {}

      console.log({ audioMedia, videoMedia })

      setState((prevState) => {
        return { ...prevState, ...audioMedia, ...videoMedia };
      });
    },
    [audioConstraints, state?.audioMedia?.track, state?.videoMedia?.track, videoConstraints]
  );

  const stop = useCallback(async (type: "video" | "audio") => {
    const name = type === "audio" ? "audioMedia" : "videoMedia";

    setState((prevState) => {
      prevState?.[name]?.track?.stop();

      return { ...prevState, [name]: null };
    });
  }, []);

  useEffect(() => {
    if (refetchOnMount) {
      init()
    }
    // eslint-disable-next-line
  }, []);

  return useMemo(() => ({
      data: state, start, stop, init
    }),
    [start, state, stop, init])
};
