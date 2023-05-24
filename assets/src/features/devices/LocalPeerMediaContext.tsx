import React, { useContext, useMemo, useState } from "react";
import { AUDIO_TRACK_CONSTRAINTS, VIDEO_TRACK_CONSTRAINTS } from "../../pages/room/consts";
import { loadObject, saveObject } from "../shared/utils/localStorage";
import { useMedia } from "./useMedia";
import { DeviceState, Type, UseUserMediaConfig, UseUserMediaStartConfig } from "./use-user-media/type";
import { useUserMedia } from "./use-user-media/useUserMedia";

export type Device = {
  stream: MediaStream | null;
  start: () => void;
  stop: () => void;
  isEnabled: boolean;
  disable: () => void;
  enable: () => void;
};

export type UserMedia = {
  id: string | null;
  setId: (id: string) => void;
  device: Device;
  error: string | null;
  devices: MediaDeviceInfo[] | null;
};

export type DisplayMedia = {
  setConfig: (constraints: MediaStreamConstraints | null) => void;
  config: MediaStreamConstraints | null;
  device: Device;
};

export type LocalPeerContext = {
  video: UserMedia;
  audio: UserMedia;
  screenShare: DisplayMedia;
  start: (config: UseUserMediaStartConfig) => void;
};

const LocalPeerMediaContext = React.createContext<LocalPeerContext | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

const LOCAL_STORAGE_VIDEO_DEVICE_KEY = "last-selected-video-device";
const LOCAL_STORAGE_AUDIO_DEVICE_KEY = "last-selected-audio-device";

const useDisplayMedia = (screenSharingConfig: MediaStreamConstraints | null) =>
  useMedia(
    useMemo(
      () => (screenSharingConfig ? () => navigator.mediaDevices.getDisplayMedia(screenSharingConfig) : null),
      [screenSharingConfig]
    )
  );

const USE_USER_MEDIA_CONFIG: UseUserMediaConfig = {
  getLastAudioDevice: () => loadObject<MediaDeviceInfo | null>(LOCAL_STORAGE_AUDIO_DEVICE_KEY, null),
  saveLastAudioDevice: (info: MediaDeviceInfo) => saveObject<MediaDeviceInfo>(LOCAL_STORAGE_AUDIO_DEVICE_KEY, info),
  getLastVideoDevice: () => loadObject<MediaDeviceInfo | null>(LOCAL_STORAGE_VIDEO_DEVICE_KEY, null),
  saveLastVideoDevice: (info: MediaDeviceInfo) => saveObject<MediaDeviceInfo>(LOCAL_STORAGE_VIDEO_DEVICE_KEY, info),
  videoTrackConstraints: VIDEO_TRACK_CONSTRAINTS,
  audioTrackConstraints: AUDIO_TRACK_CONSTRAINTS,
  refetchOnMount: true,
};

const useMediaData = (
  data: DeviceState | null,
  type: Type,
  localStorageKey: string,
  start: (config: UseUserMediaStartConfig) => void,
  stop: (type: Type) => void,
  setEnable: (type: Type, value: boolean) => void
) => {
  const deviceIdKey: keyof UseUserMediaStartConfig = type === "video" ? "videoDeviceId" : "audioDeviceId";

  return useMemo(
    (): UserMedia => ({
      id: data?.media?.deviceInfo?.deviceId || null,
      setId: (value: string) => start({ [deviceIdKey]: value }),
      device: {
        stream: data?.media?.stream || null,
        stop: () => stop(type),
        start: () => start({ [deviceIdKey]: loadObject<MediaDeviceInfo | null>(localStorageKey, null)?.deviceId }),
        disable: () => setEnable(type, false),
        enable: () => setEnable(type, true),
        isEnabled: !!data?.media?.enabled,
      },
      devices: data?.devices || null,
      error: data?.error?.name || null,
    }),
    [data, stop, start, setEnable, type, localStorageKey, deviceIdKey]
  );
};

export const LocalPeerMediaProvider = ({ children }: Props) => {
  const { data, stop, start, setEnable } = useUserMedia(USE_USER_MEDIA_CONFIG);

  const [screenSharingConfig, setScreenSharingConfig] = useState<MediaStreamConstraints | null>(null);
  const screenSharingDevice: Device = useDisplayMedia(screenSharingConfig);

  const video: UserMedia = useMediaData(
    data?.video || null,
    "video",
    LOCAL_STORAGE_VIDEO_DEVICE_KEY,
    start,
    stop,
    setEnable
  );

  const audio: UserMedia = useMediaData(
    data?.audio || null,
    "audio",
    LOCAL_STORAGE_AUDIO_DEVICE_KEY,
    start,
    stop,
    setEnable
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
    <LocalPeerMediaContext.Provider
      value={{
        video,
        audio,
        screenShare,
        start,
      }}
    >
      {children}
    </LocalPeerMediaContext.Provider>
  );
};

export const useLocalPeer = (): LocalPeerContext => {
  const context = useContext(LocalPeerMediaContext);
  if (!context) throw new Error("useLocalPeer must be used within a LocalPeerMediaContext");
  return context;
};
