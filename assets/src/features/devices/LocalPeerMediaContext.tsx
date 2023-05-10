import React, { useContext, useMemo, useState } from "react";
import { AUDIO_TRACK_CONSTRAINTS, VIDEO_TRACK_CONSTRAINTS } from "../../pages/room/consts";
import { loadObject, saveObject } from "../shared/utils/localStorage";
import { useMedia } from "./useMedia";
import { UseUserMediaConfig, UseUserMediaStartConfig } from "./use-user-media/types";
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

export type LocalPeerContextType = {
  video: UserMedia;
  audio: UserMedia;
  screenShare: DisplayMedia;
  start: (config: UseUserMediaStartConfig) => void;
};

const LocalPeerMediaContext = React.createContext<LocalPeerContextType | undefined>(undefined);

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

export const LocalPeerMediaProvider = ({ children }: Props) => {
  const { data, stop, start, setEnable } = useUserMedia(USE_USER_MEDIA_CONFIG);

  const [screenSharingConfig, setScreenSharingConfig] = useState<MediaStreamConstraints | null>(null);
  const screenSharingDevice: Device = useDisplayMedia(screenSharingConfig);

  const video: UserMedia = useMemo(
    (): UserMedia => ({
      id: data?.video.media?.deviceInfo?.deviceId || null,
      setId: (value: string) => start({ videoDeviceId: value }),
      device: {
        stream: data?.video.media?.stream || null,
        stop: () => stop("video"),
        start: () =>
          start({ videoDeviceId: loadObject<MediaDeviceInfo | null>(LOCAL_STORAGE_VIDEO_DEVICE_KEY, null)?.deviceId }),
        disable: () => setEnable("video", false),
        enable: () => setEnable("video", true),
        isEnabled: !!data?.video.media?.enabled,
      },
      devices: data?.video.devices || null,
      error: data?.video.error?.name || null,
    }),
    [data, stop, start, setEnable]
  );

  const audio: UserMedia = useMemo(
    (): UserMedia => ({
      id: data?.audio.media?.deviceInfo?.deviceId || null,
      setId: (value: string) => start({ audioDeviceId: value }),
      device: {
        stream: data?.audio.media?.stream || null,
        stop: () => {
          stop("audio");
        },
        start: () => {
          start({ audioDeviceId: loadObject<MediaDeviceInfo | null>(LOCAL_STORAGE_AUDIO_DEVICE_KEY, null)?.deviceId });
        },
        disable: () => setEnable("audio", false),
        enable: () => setEnable("audio", true),
        isEnabled: !!data?.audio.media?.enabled,
      },
      devices: data?.audio.devices || null,
      error:  data?.audio.error?.name || null,
    }),
    [data, stop, start, setEnable]
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

export const useLocalPeer = (): LocalPeerContextType => {
  const context = useContext(LocalPeerMediaContext);
  if (!context) throw new Error("useLocalPeer must be used within a LocalPeerMediaContext");
  return context;
};
