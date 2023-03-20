import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useMediaGeneric, UseUserMedia } from "@jellyfish-dev/jellyfish-reacy-client/navigator";
import { devicesOrNull, getStringValue, selectDeviceId } from "../features/home-page/components/HomePageVideoTile";
import {
  AUDIO_TRACK_CONSTRAINS,
  useEnumerateDevices,
  VIDEO_TRACK_CONSTRAINTS,
} from "@jellyfish-dev/jellyfish-reacy-client/navigator";

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
  allVideoDevices: MediaDeviceInfo[] | null;
  allAudioDevices: MediaDeviceInfo[] | null;
};

const LocalPeerContext = React.createContext<LocalPeerContextType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export const LocalPeerProvider = ({ children }: Props) => {
  const [videoDeviceId, setVideoDeviceIdInner] = useState<string | null>(null);

  const videoDevice: UseUserMedia = useMediaGeneric(
    useMemo(
      () => (videoDeviceId ? () => navigator.mediaDevices.getUserMedia({ video: { deviceId: videoDeviceId } }) : null),
      [videoDeviceId]
    )
  );

  const [audioDeviceId, setAudioDeviceIdInner] = useState<string | null>(null);

  const audioDevice = useMediaGeneric(
    useMemo(
      () => (audioDeviceId ? () => navigator.mediaDevices.getUserMedia({ audio: { deviceId: audioDeviceId } }) : null),
      [audioDeviceId]
    )
  );

  const [screenSharingConfig, setScreenSharingConfig] = useState<MediaStreamConstraints | null>(null);

  const screenSharingDevice = useMediaGeneric(
    useMemo(
      () => (screenSharingConfig ? () => navigator.mediaDevices.getDisplayMedia(screenSharingConfig) : null),
      [screenSharingConfig]
    )
  );

  const devices = useEnumerateDevices(VIDEO_TRACK_CONSTRAINTS, AUDIO_TRACK_CONSTRAINS);

  const allVideoDevices: MediaDeviceInfo[] | null = useMemo(() => devicesOrNull(devices, "video"), [devices]);
  const allAudioDevices: MediaDeviceInfo[] | null = useMemo(() => devicesOrNull(devices, "audio"), [devices]);

  useEffect(() => {
    console.log({ allVideoDevices });
  }, [allVideoDevices]);

  useEffect(() => {
    if (allVideoDevices) {
      const lastSelectedVideoId = getStringValue("last-selected-video-id");
      const video = selectDeviceId(allVideoDevices, lastSelectedVideoId);
      if (video) {
        setVideoDeviceIdInner(video);
      }
      if (video) {
        localStorage.setItem("last-selected-video-id", video);
      }
    }

    if (allAudioDevices) {
      const lastSelectedAudioId = getStringValue("last-selected-audio-id");
      const result = selectDeviceId(allAudioDevices, lastSelectedAudioId);
      if (result) {
        setAudioDeviceIdInner(result);
      }
      if (result) {
        localStorage.setItem("last-selected-audio-id", result);
      }
    }
  }, [allVideoDevices, allAudioDevices, setVideoDeviceIdInner]);

  const setVideoDeviceId = useCallback((value: string | null) => {
    setVideoDeviceIdInner(value);
    if (value === null) {
      localStorage.removeItem("last-selected-video-id");
    } else {
      localStorage.setItem("last-selected-video-id", value);
    }
  }, []);

  const setAudioDeviceId = useCallback(
    (value: string | null) => {
      setAudioDeviceIdInner(value);
      if (value === null) {
        localStorage.removeItem("last-selected-audio-id");
      } else {
        localStorage.setItem("last-selected-audio-id", value);
      }
    },
    [setAudioDeviceIdInner]
  );

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
        allVideoDevices,
        allAudioDevices,
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
