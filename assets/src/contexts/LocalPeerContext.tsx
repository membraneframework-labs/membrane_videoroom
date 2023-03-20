import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useMediaGeneric, UseUserMedia } from "@jellyfish-dev/jellyfish-reacy-client/navigator";
import { devicesOrNull, getLocalStorageItem, selectDeviceId } from "../features/home-page/components/HomePageVideoTile";
import { useEnumerateDevices, VIDEO_TRACK_CONSTRAINTS } from "@jellyfish-dev/jellyfish-reacy-client/navigator";
import { AUDIO_TRACK_CONSTRAINTS } from "../pages/room/consts";

export type LocalPeerContextType = {
  videoDeviceId: string | null;
  setVideoDeviceId: (id: string | null) => void;
  videoDevice: UseUserMedia;
  audioDeviceId: string | null;
  setAudioDeviceId: (id: string | null) => void;
  audioDevice: UseUserMedia;
  setScreenSharingConfig: (constraints: MediaStreamConstraints | null) => void;
  screenSharingConfig: MediaStreamConstraints | null;
  screenSharingDevice: UseUserMedia;
  videoDevices: MediaDeviceInfo[] | null;
  audioDevices: MediaDeviceInfo[] | null;
};

const LocalPeerContext = React.createContext<LocalPeerContextType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

const localStorageVideoId = "last-selected-video-id";
const localStorageAudioId = "last-selected-audio-id";

const useUserMedia = (type: "video" | "audio", deviceId: string | null) =>
  useMediaGeneric(
    useMemo(
      () => (deviceId ? () => navigator.mediaDevices.getUserMedia({ [type]: { deviceId } }) : null),
      [deviceId, type]
    )
  );

const useDisplayMedia = (screenSharingConfig: MediaStreamConstraints | null) =>
  useMediaGeneric(
    useMemo(
      () => (screenSharingConfig ? () => navigator.mediaDevices.getDisplayMedia(screenSharingConfig) : null),
      [screenSharingConfig]
    )
  );

const setLocalStorage = (value: string | null, key: string) => {
  if (value === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, value);
  }
};

const selectDefaultDevice = (
  devices: MediaDeviceInfo[] | null,
  setDeviceId: (value: string | null) => void,
  localStorageName: string
) => {
  if (devices) {
    const localStorageDeviceId = getLocalStorageItem(localStorageName);
    const device = selectDeviceId(devices, localStorageDeviceId);
    if (device) {
      setDeviceId(device);
    }
  }
};

const audio = {
  advanced: [{ autoGainControl: true }, { noiseSuppression: true }, { echoCancellation: true }],
};

export const LocalPeerProvider = ({ children }: Props) => {
  const [videoDeviceId, setVideoDeviceIdInner] = useState<string | null>(null);

  const videoDevice: UseUserMedia = useUserMedia("video", videoDeviceId);
  const [audioDeviceId, setAudioDeviceIdInner] = useState<string | null>(null);

  const audioDevice: UseUserMedia = useUserMedia("audio", audioDeviceId);
  const [screenSharingConfig, setScreenSharingConfig] = useState<MediaStreamConstraints | null>(null);

  const screenSharingDevice: UseUserMedia = useDisplayMedia(screenSharingConfig);
  const devices = useEnumerateDevices(VIDEO_TRACK_CONSTRAINTS, audio);

  const videoDevices: MediaDeviceInfo[] | null = useMemo(() => devicesOrNull(devices, "video"), [devices]);
  const audioDevices: MediaDeviceInfo[] | null = useMemo(() => devicesOrNull(devices, "audio"), [devices]);

  console.log({ videoDevices, audioDevices });

  const setVideoDeviceId = useCallback((value: string | null) => {
    setVideoDeviceIdInner(value);
    setLocalStorage(value, localStorageVideoId);
  }, []);

  const setAudioDeviceId = useCallback((value: string | null) => {
    setAudioDeviceIdInner(value);
    setLocalStorage(value, localStorageAudioId);
  }, []);

  useEffect(() => {
    selectDefaultDevice(videoDevices, setVideoDeviceId, localStorageVideoId);
    selectDefaultDevice(audioDevices, setAudioDeviceId, localStorageAudioId);
  }, [videoDevices, audioDevices, setVideoDeviceId, setAudioDeviceId]);

  return (
    <LocalPeerContext.Provider
      value={{
        videoDeviceId,
        setVideoDeviceId: setVideoDeviceId,
        videoDevice,
        audioDeviceId,
        setAudioDeviceId: setAudioDeviceId,
        audioDevice,
        screenSharingConfig,
        setScreenSharingConfig,
        screenSharingDevice,
        videoDevices,
        audioDevices,
      }}
    >
      {children}
    </LocalPeerContext.Provider>
  );
};

export const useLocalPeer = (): LocalPeerContextType => {
  const context = useContext(LocalPeerContext);
  if (!context) throw new Error("useLocalPeer must be used within a LocalPeerContext");
  return context;
};
