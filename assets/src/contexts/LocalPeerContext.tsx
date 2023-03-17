import React, { useContext, useMemo, useState } from "react";
import { useMediaGeneric, UseUserMedia } from "@jellyfish-dev/jellyfish-reacy-client/navigator";

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
};

const LocalPeerContext = React.createContext<LocalPeerContextType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export const LocalPeerProvider = ({ children }: Props) => {
  const [videoDeviceId, setVideoDeviceId] = useState<string | null>(null);

  const videoDevice: UseUserMedia = useMediaGeneric(
    useMemo(
      () => (videoDeviceId ? () => navigator.mediaDevices.getUserMedia({ video: { deviceId: videoDeviceId } }) : null),
      [videoDeviceId]
    )
  );

  const [audioDeviceId, setAudioDeviceId] = useState<string | null>(null);

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

  return (
    <LocalPeerContext.Provider
      value={{
        videoDeviceId,
        setVideoDeviceId,
        videoDevice,
        audioDeviceId,
        setAudioDeviceId,
        audioDevice,
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
