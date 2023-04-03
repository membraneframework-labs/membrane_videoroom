import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
// import {
//   UseEnumerateDevices,
//   useEnumerateDevices,
//   useMedia,
//   useUserMedia,
//   UseUserMedia,
//   useUserMediaById,
// } from "@jellyfish-dev/jellyfish-react-client/navigator";
import { AUDIO_TRACK_CONSTRAINTS, VIDEO_TRACK_CONSTRAINTS } from "../../pages/room/consts";
import { MediaType } from "@jellyfish-dev/jellyfish-react-client/dist/navigator/types";
import { useMedia, useUserMedia, UseUserMedia } from "@jellyfish-dev/jellyfish-react-client/navigator";
import { useEnumerateDevices, UseEnumerateDevices } from "./useEnumerateDevices";

export type UserMedia = {
  id: string | null;
  setId: (id: string | null) => void;
  device: UseUserMedia;
  error: string | null;
  devices: MediaDeviceInfo[] | null;
};

export type DisplayMedia = {
  setConfig: (constraints: MediaStreamConstraints | null) => void;
  config: MediaStreamConstraints | null;
  device: UseUserMedia;
};

export type LocalPeerContextType = {
  video: UserMedia;
  audio: UserMedia;
  screenShare: DisplayMedia;
};

const LocalPeerContext = React.createContext<LocalPeerContextType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

const LOCAL_STORAGE_VIDEO_ID_KEY = "last-selected-video-id";
const LOCAL_STORAGE_AUDIO_ID_KEY = "last-selected-audio-id";

const selectDeviceId = (
  devices: MediaDeviceInfo[],
  requestedDevice: string | null,
  lastSelectedDeviceId: string | null
) => {
  if (requestedDevice) return requestedDevice;

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

const setLocalStorage = (key: string, value: string | null) => {
  if (value === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, value);
  }
};

const getLocalStorageItem = (key: string, defaultValue: string | null = null): string | null => {
  const stringValue = localStorage.getItem(key);
  return stringValue === null || stringValue === undefined ? defaultValue : stringValue;
};

const selectDefaultDevice = (
  type: MediaType,
  enumeratedDevices: UseEnumerateDevices,
  setDeviceId: (value: string | null) => void,
  localStorageName: string
) => {
  const result = enumeratedDevices?.[type];
  if (result?.type !== "OK") return;
  const devices = result.devices;

  const localStorageDeviceId = getLocalStorageItem(localStorageName);
  const device = selectDeviceId(devices, result.selectedDeviceSettings?.deviceId || null, localStorageDeviceId);
  if (device) {
    setDeviceId(device);
  }
};

const devicesOrNull = (devices: UseEnumerateDevices | null, type: MediaType) => {
  const device = devices?.[type];
  return device?.type === "OK" ? device.devices : null;
};

const useUserMediaById = (type: MediaType, constraints: MediaTrackConstraints, id: string | null) => {
  const result = useMemo(() => {
    if (id === null) return null;

    return { [type]: { ...constraints, deviceId: id } };
  }, [constraints, id, type]);

  return useUserMedia(result);
};

export const LocalPeerProvider = ({ children }: Props) => {
  const [videoDeviceId, setVideoDeviceIdInner] = useState<string | null>(null);

  const videoDevice: UseUserMedia = useUserMediaById("video", VIDEO_TRACK_CONSTRAINTS, videoDeviceId);
  const [audioDeviceId, setAudioDeviceIdInner] = useState<string | null>(null);

  const audioDevice: UseUserMedia = useUserMediaById("audio", AUDIO_TRACK_CONSTRAINTS, audioDeviceId);
  const [screenSharingConfig, setScreenSharingConfig] = useState<MediaStreamConstraints | null>(null);

  const videoConstraintsWithId = useMemo(() => {
    return { ...VIDEO_TRACK_CONSTRAINTS, deviceId: getLocalStorageItem(LOCAL_STORAGE_VIDEO_ID_KEY) || undefined };
  }, []);

  const audioConstraintsWithId = useMemo(() => {
    return { ...AUDIO_TRACK_CONSTRAINTS, deviceId: getLocalStorageItem(LOCAL_STORAGE_AUDIO_ID_KEY) || undefined };
  }, []);

  const screenSharingDevice: UseUserMedia = useDisplayMedia(screenSharingConfig);
  const devices = useEnumerateDevices(videoConstraintsWithId, audioConstraintsWithId);

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
    setLocalStorage(LOCAL_STORAGE_VIDEO_ID_KEY, value);
  }, []);

  const setAudioDeviceId = useCallback((value: string | null) => {
    setAudioDeviceIdInner(value);
    setLocalStorage(LOCAL_STORAGE_AUDIO_ID_KEY, value);
  }, []);

  const videoDevices: MediaDeviceInfo[] | null = useMemo(() => devicesOrNull(devices, "video"), [devices]);
  const audioDevices: MediaDeviceInfo[] | null = useMemo(() => devicesOrNull(devices, "audio"), [devices]);

  useEffect(() => {
    if (devices === null) return;

    selectDefaultDevice("video", devices, setVideoDeviceId, LOCAL_STORAGE_VIDEO_ID_KEY);
    selectDefaultDevice("audio", devices, setAudioDeviceId, LOCAL_STORAGE_AUDIO_ID_KEY);
  }, [setVideoDeviceId, setAudioDeviceId, devices]);

  const video: UserMedia = useMemo(
    () => ({
      id: videoDeviceId,
      setId: setVideoDeviceId,
      device: videoDevice,
      devices: videoDevices,
      error: videoDeviceError,
    }),
    [setVideoDeviceId, videoDevice, videoDeviceError, videoDeviceId, videoDevices]
  );

  const audio: UserMedia = useMemo(
    () => ({
      id: audioDeviceId,
      setId: setAudioDeviceId,
      device: audioDevice,
      devices: audioDevices,
      error: audioDeviceError,
    }),
    [audioDeviceId, setAudioDeviceId, audioDevice, audioDevices, audioDeviceError]
  );

  const screenShare: DisplayMedia = useMemo(
    () => ({
      config: screenSharingConfig,
      setConfig: setScreenSharingConfig,
      device: screenSharingDevice,
    }),
    [screenSharingConfig, screenSharingDevice]
  );

  return (
    <LocalPeerContext.Provider
      value={{
        video,
        audio,
        screenShare,
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
