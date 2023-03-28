import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DeviceReturnType,
  isAudio,
  isGranted,
  isNotGranted,
  isVideo,
  toMediaTrackConstraints,
  useEnumerateDevices,
  useMedia,
  UseUserMedia,
  useUserMediaById,
} from "@jellyfish-dev/jellyfish-react-client/navigator";
import { AUDIO_TRACK_CONSTRAINTS, VIDEO_TRACK_CONSTRAINTS } from "../pages/room/consts";
import { UseEnumerateDevices } from "@jellyfish-dev/jellyfish-react-client/dist/navigator";

export type LocalPeerContextType = {
  videoDeviceId: string | null;
  setVideoDeviceId: (id: string | null) => void;
  videoDevice: UseUserMedia;
  videoDeviceError: string | null;
  videoDevices: MediaDeviceInfo[] | null;
  audioDeviceId: string | null;
  setAudioDeviceId: (id: string | null) => void;
  audioDevice: UseUserMedia;
  audioDeviceError: string | null;
  audioDevices: MediaDeviceInfo[] | null;
  setScreenSharingConfig: (constraints: MediaStreamConstraints | null) => void;
  screenSharingConfig: MediaStreamConstraints | null;
  screenSharingDevice: UseUserMedia;
};

const LocalPeerContext = React.createContext<LocalPeerContextType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

const localStorageVideoId = "last-selected-video-id";
const localStorageAudioId = "last-selected-audio-id";

const selectDeviceId = (devices: MediaDeviceInfo[], lastSelectedDeviceId: string | null) => {
  const result = devices.some(({ deviceId }) => deviceId === lastSelectedDeviceId);
  if (result) return lastSelectedDeviceId;

  const firstDevice = devices.find(({ deviceId }) => deviceId);
  return firstDevice ? firstDevice.deviceId : null;
};

const useDisplayMedia = (screenSharingConfig: MediaStreamConstraints | null) =>
  useMedia(
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

const getLocalStorageItem = (name: string, defaultValue: string | null = null): string | null => {
  const stringValue = localStorage.getItem(name);
  return stringValue === null || stringValue === undefined ? defaultValue : stringValue;
};

const selectDefaultDevice = (
  devices: MediaDeviceInfo[] | null,
  setDeviceId: (value: string | null) => void,
  localStorageName: string
) => {
  if (!devices) return;

  const localStorageDeviceId = getLocalStorageItem(localStorageName);
  const device = selectDeviceId(devices, localStorageDeviceId);
  if (device) {
    setDeviceId(device);
  }
};

const devicesOrNull = (devices: UseEnumerateDevices | null, type: "audio" | "video") => {
  const device = devices?.[type];
  return device?.type === "OK" ? device.devices : null;
};

export const LocalPeerProvider = ({ children }: Props) => {
  const [videoDeviceId, setVideoDeviceIdInner] = useState<string | null>(null);

  const videoDevice: UseUserMedia = useUserMediaById("video", videoDeviceId);
  const [audioDeviceId, setAudioDeviceIdInner] = useState<string | null>(null);

  const audioDevice: UseUserMedia = useUserMediaById("audio", audioDeviceId);
  const [screenSharingConfig, setScreenSharingConfig] = useState<MediaStreamConstraints | null>(null);

  const screenSharingDevice: UseUserMedia = useDisplayMedia(screenSharingConfig);
  const devices = useEnumerateDevices(VIDEO_TRACK_CONSTRAINTS, AUDIO_TRACK_CONSTRAINTS);
  console.log({ devices });

  const videoDevices: MediaDeviceInfo[] | null = useMemo(() => devicesOrNull(devices, "video"), [devices]);
  const audioDevices: MediaDeviceInfo[] | null = useMemo(() => devicesOrNull(devices, "audio"), [devices]);
  const audioDeviceError: string | null = useMemo(
    () => (devices?.audio.type === "Error" ? devices.audio.name : null),
    [devices]
  );

  const videoDeviceError: string | null = useMemo(
    () => (devices?.video.type === "Error" ? devices.video.name : null),
    [devices]
  );

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
        videoDevices,
        videoDeviceError,
        audioDeviceId,
        setAudioDeviceId: setAudioDeviceId,
        audioDevice,
        audioDevices,
        audioDeviceError,
        screenSharingConfig,
        setScreenSharingConfig,
        screenSharingDevice,
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
