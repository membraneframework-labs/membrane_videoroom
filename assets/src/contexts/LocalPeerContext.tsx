import React, { useContext, useEffect, useMemo, useState } from "react";
import { useMediaGeneric, UseUserMedia } from "@jellyfish-dev/jellyfish-reacy-client/navigator";

export type UserContextType = {
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

const LocalPeerContext = React.createContext<UserContextType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export const LocalPeerProvider = ({ children }: Props) => {
  const [videoDeviceId, setVideoDeviceId] = useState<string | null>(null);

  const videoDevice: UseUserMedia = useMediaGeneric(
    useMemo(() => {
      const result = videoDeviceId ? () => navigator.mediaDevices.getUserMedia({ video: { deviceId: videoDeviceId } }) : null;
      console.log("Video result", result);

      return result;
    }, [videoDeviceId])
  );

  useEffect(() => {
    console.log({ videoDevice });
  }, [videoDevice])

  const [audioDeviceId, setAudioDeviceId] = useState<string | null>(null);

  const audioDevice = useMediaGeneric(
    useMemo(() => {
      const result = audioDeviceId
        ? () => navigator.mediaDevices.getUserMedia({ audio: { deviceId: audioDeviceId } })
        : null;
      console.log("Audio result", result);

      return result;
    }, [audioDeviceId])
  );

  const [screenSharingConfig, setScreenSharingConfig] = useState<MediaStreamConstraints | null>(null);

  const screenSharingDevice = useMediaGeneric(
    useMemo(() => {
      const result = screenSharingConfig ? () => navigator.mediaDevices.getDisplayMedia(screenSharingConfig) : null;
      console.log("Screen sharing result", result);
      return result;
    }, [screenSharingConfig])
  );

  // useEffect(() => {
  //   console.log({ videoDeviceMedia });
  // }, [videoDeviceMedia]);

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

export const useLocalPeer = (): UserContextType => {
  const context = useContext(LocalPeerContext);
  if (!context) throw new Error("useLocalPeer must be used within a LocalPeerContext");
  return context;
};
