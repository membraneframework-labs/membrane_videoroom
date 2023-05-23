import { useCallback, useEffect, useState } from "react";
import { ErrorMessage } from "../errorMessage";

type MediaDeviceManagerConfig = {
  askOnMount?: boolean;
};

const showMediaDevicesPrompt = (constraints: MediaStreamConstraints, onSuccess: () => void, onError: () => void) => {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((mediaStream) => {
      onSuccess();
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
    })
    .catch(() => {
      onError();
    });
};

export const useMediaDeviceManager = ({ askOnMount }: MediaDeviceManagerConfig = {}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [asked, setAsked] = useState(!askOnMount);
  const [audioPermissionGranted, setAudioPermissionGranted] = useState<boolean | null>(null);
  const [videoPermissionGranted, setVideoPermissionGranted] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | undefined>();

  const handleError = useCallback(
    (text: string, id?: string) => {
      console.error(text);
      setErrorMessage({ message: text, id: id });
    },
    [setErrorMessage]
  );

  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then((mediaDevices) => {
      setDevices(mediaDevices);
    });
  }, []);

  useEffect(() => {
    if (devices.length === 0) return;

    const emptyId = devices.filter((device) => device.kind === "audioinput").find((device) => device.deviceId === "");
    setAudioPermissionGranted(!emptyId);
  }, [devices]);

  useEffect(() => {
    if (devices.length === 0) return;

    const emptyId = devices.filter((device) => device.kind === "videoinput").find((device) => device.deviceId === "");
    setVideoPermissionGranted(!emptyId);
  }, [devices]);

  const askForPermissions = useCallback(() => {
    if (!audioPermissionGranted && !videoPermissionGranted) {
      showMediaDevicesPrompt(
        { video: true, audio: true },
        () => {
          setAudioPermissionGranted(true);
          setVideoPermissionGranted(true);
        },
        () => handleError("You didn't allow this site to use Camera and Microphone", "audio-and-video-permission-error")
      );
    } else if (!audioPermissionGranted) {
      showMediaDevicesPrompt(
        { audio: true },
        () => {
          setAudioPermissionGranted(true);
        },
        () => handleError("You didn't allow this site to use Microphone", "audio-permission-error")
      );
    } else if (!videoPermissionGranted) {
      showMediaDevicesPrompt(
        { video: true },
        () => {
          setVideoPermissionGranted(true);
        },
        () => handleError("You didn't allow this site to use Camera", "video-permission-error")
      );
    }
  }, [audioPermissionGranted, handleError, videoPermissionGranted]);

  useEffect(() => {
    if (asked) return;
    if (devices.length === 0) return;
    if (audioPermissionGranted === null) return;
    if (videoPermissionGranted === null) return;

    askForPermissions();

    setAsked(true);
  }, [devices, audioPermissionGranted, videoPermissionGranted, asked, askForPermissions]);

  return { devices, audioPermissionGranted, videoPermissionGranted, errorMessage, askForPermissions };
};
