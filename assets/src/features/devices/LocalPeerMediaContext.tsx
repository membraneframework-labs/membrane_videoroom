import React, { useCallback, useContext, useMemo, useState } from "react";
import { AUDIO_TRACK_CONSTRAINTS, VIDEO_TRACK_CONSTRAINTS } from "../../pages/room/consts";
import { MediaType } from "@jellyfish-dev/jellyfish-react-client/dist/navigator/types";
import { useMedia, UseUserMedia as UseUserMedia2 } from "@jellyfish-dev/browser-media-utils";
import { loadObject, saveObject, useUserMedia, UseUserMediaConfig, UseUserMediaState } from "./useUserMedia";

export type UserMedia = {
  id: string | null;
  setId: (id: string | null) => void;
  device: UseUserMedia2;
  error: string | null;
  devices: MediaDeviceInfo[] | null;
};

export type DisplayMedia = {
  setConfig: (constraints: MediaStreamConstraints | null) => void;
  config: MediaStreamConstraints | null;
  device: UseUserMedia2;
};

export type LocalPeerContextType = {
  video: UserMedia;
  audio: UserMedia;
  screenShare: DisplayMedia;
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

const devicesOrNull = (devices: UseUserMediaState | null, type: MediaType) => {
  const device = devices?.[type];
  return device?.type === "OK" ? device.devices : null;
};

const USE_USER_MEDIA_CONFIG: UseUserMediaConfig = {
  getPreviousAudioDevice: () => loadObject(LOCAL_STORAGE_AUDIO_DEVICE_KEY, null),
  getPreviousVideoDevice: () => loadObject(LOCAL_STORAGE_VIDEO_DEVICE_KEY, null),
  videoTrackConstraints: VIDEO_TRACK_CONSTRAINTS,
  audioTrackConstraints: AUDIO_TRACK_CONSTRAINTS,
  refetchOnMount: true,
};

export const LocalPeerMediaProvider = ({ children }: Props) => {
  const { data, stop, start, setEnable } = useUserMedia(USE_USER_MEDIA_CONFIG);

  const [screenSharingConfig, setScreenSharingConfig] = useState<MediaStreamConstraints | null>(null);
  const screenSharingDevice: UseUserMedia2 = useDisplayMedia(screenSharingConfig);

  const audioDeviceError: string | null = useMemo(
    () => (data?.audio.type === "Error" ? data.audio.name : null),
    [data]
  );

  const videoDeviceError: string | null = useMemo(
    () => (data?.video.type === "Error" ? data.video.name : null),
    [data]
  );

  const setVideoDeviceId = useCallback(
    (value: string | null) => {
      if (data?.video.type !== "OK" || data.videoMedia?.deviceInfo?.deviceId === value) return;

      const newDevice = data.video.devices.find(({ deviceId }) => deviceId === value) || null;
      saveObject(LOCAL_STORAGE_VIDEO_DEVICE_KEY, newDevice);
      if (value) {
        start({ videoDeviceId: value });
      }
    },
    [data, start]
  );

  const setAudioDeviceId = useCallback(
    (value: string | null) => {
      if (data?.audio.type !== "OK" || data.audioMedia?.deviceInfo?.deviceId === value) return;

      const newDevice = data.audio.devices.find(({ deviceId }) => deviceId === value);
      saveObject(LOCAL_STORAGE_AUDIO_DEVICE_KEY, newDevice);

      if (value) {
        start({ audioDeviceId: value });
      }
    },
    [data, start]
  );

  const videoDevices: MediaDeviceInfo[] | null = useMemo(() => devicesOrNull(data, "video"), [data]);
  const audioDevices: MediaDeviceInfo[] | null = useMemo(() => devicesOrNull(data, "audio"), [data]);

  const video: UserMedia = useMemo(() => {
    return {
      id: data?.videoMedia?.deviceInfo?.deviceId || null,
      setId: setVideoDeviceId,
      device: {
        stream: data?.videoMedia?.stream || null,
        isError: false,
        isLoading: false,
        stop: () => stop("video"),
        start: () => start({ videoDeviceId: data?.videoMedia?.deviceInfo?.deviceId }),
        disable: () => setEnable("video", false),
        enable: () => setEnable("video", true),
        isEnabled: !!data?.videoMedia?.enabled,
      },
      devices: videoDevices,
      error: videoDeviceError,
    };
  }, [data, videoDeviceError, videoDevices, stop, start, setVideoDeviceId, setEnable]);

  const audio: UserMedia = useMemo(
    () => ({
      id: data?.audioMedia?.deviceInfo?.deviceId || null,
      setId: setAudioDeviceId,
      device: {
        stream: data?.audioMedia?.stream || null,
        isError: false,
        isLoading: false,
        stop: () => stop("audio"),
        start: () => start({ audioDeviceId: data?.audioMedia?.deviceInfo?.deviceId }),
        disable: () => setEnable("audio", false),
        enable: () => setEnable("audio", true),
        isEnabled: !!data?.videoMedia?.enabled,
      },
      devices: audioDevices,
      error: audioDeviceError,
    }),
    [data, audioDeviceError, audioDevices, stop, start, setAudioDeviceId, setEnable]
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
