import { useEffect, useRef, useState } from "react";
import {
  isAudio,
  isGranted,
  isNotGranted,
  isVideo,
  toMediaTrackConstraints,
} from "@jellyfish-dev/jellyfish-react-client/navigator";

export type DeviceReturnType =
  | { type: "OK"; devices: MediaDeviceInfo[]; selectedDeviceSettings: MediaTrackSettings | null }
  | { type: "Error"; name: string | null }
  | { type: "Not requested" };

export const prepareReturn = (
  isInterested: boolean,
  mediaDeviceInfo: MediaDeviceInfo[],
  permissionError: string | null,
  selectedDeviceSettings: MediaTrackSettings | null
): DeviceReturnType => {
  if (!isInterested) return { type: "Not requested" };
  if (permissionError) return { type: "Error", name: permissionError };
  return { type: "OK", devices: mediaDeviceInfo.filter(isGranted), selectedDeviceSettings };
};

export type UseEnumerateDevices = {
  audio: DeviceReturnType | { type: "Loading" } | { type: "Requesting" };
  video: DeviceReturnType | { type: "Loading" } | { type: "Requesting" };
};

const getRequestedDeviceSettings = (
  detailedSettings: Array<MediaTrackSettings>,
  deviceIds: MediaDeviceInfo[]
): MediaTrackSettings | null => {
  const videoDeviceIds = deviceIds.map((info) => info.deviceId);

  return detailedSettings.find((settings) => settings.deviceId && videoDeviceIds.includes(settings.deviceId)) || null;
};

const getName = (obj: unknown): string | null =>
  obj && typeof obj === "object" && "name" in obj && typeof obj.name === "string" ? obj["name"] : null;

export const useEnumerateDevices = (
  video: boolean | MediaTrackConstraints,
  audio: boolean | MediaTrackConstraints
): UseEnumerateDevices | null => {
  const [state, setState] = useState<UseEnumerateDevices | null>(null);
  const skip = useRef<boolean>(false);

  useEffect(() => {
    (async (videoParam: boolean | MediaTrackConstraints, audioParam: boolean | MediaTrackConstraints) => {
      if (!navigator?.mediaDevices) throw Error("Navigator is available only in secure contexts");
      if (skip.current) return;
      skip.current = true;

      const objAudio = toMediaTrackConstraints(audioParam);
      const objVideo = toMediaTrackConstraints(videoParam);

      const booleanAudio = !!audioParam;
      const booleanVideo = !!videoParam;

      setState(() => ({
        audio: booleanAudio ? { type: "Loading" } : { type: "Not requested" },
        video: booleanVideo ? { type: "Loading" } : { type: "Not requested" },
      }));

      let mediaDeviceInfos: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();

      const videoNotGranted = mediaDeviceInfos.filter(isVideo).some(isNotGranted);
      const audioNotGranted = mediaDeviceInfos.filter(isAudio).some(isNotGranted);

      const constraints = {
        video: booleanVideo && videoNotGranted && objVideo,
        audio: booleanAudio && audioNotGranted && objAudio,
      };

      let audioError: string | null = null;
      let videoError: string | null = null;

      const detailedSettings: Array<MediaTrackSettings> = [];

      try {
        if (constraints.audio || constraints.video) {
          setState((prevState) => ({
            audio: constraints.audio ? { type: "Requesting" } : prevState?.audio ?? { type: "Loading" },
            video: constraints.video ? { type: "Requesting" } : prevState?.video ?? { type: "Loading" },
          }));

          const requestedDevices = await navigator.mediaDevices.getUserMedia(constraints);

          mediaDeviceInfos = await navigator.mediaDevices.enumerateDevices();

          requestedDevices.getTracks().forEach((track) => {
            const settings = track.getSettings();
            if (settings.deviceId) {
              detailedSettings.push(settings);
            }
            track.stop();
          });
        }
      } catch (error: unknown) {
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#exceptions
        const errorName = getName(error);
        videoError = booleanVideo && videoNotGranted ? errorName : null;
        audioError = booleanAudio && audioNotGranted ? errorName : null;
      }

      const videoDevices = mediaDeviceInfos.filter(isVideo);
      const audioDevices = mediaDeviceInfos.filter(isAudio);

      setState({
        video: prepareReturn(
          booleanVideo,
          videoDevices,
          videoError,
          getRequestedDeviceSettings(detailedSettings, videoDevices)
        ),
        audio: prepareReturn(
          booleanAudio,
          audioDevices,
          audioError,
          getRequestedDeviceSettings(detailedSettings, audioDevices)
        ),
      });
    })(video, audio);
  }, [video, audio]);

  return state;
};
