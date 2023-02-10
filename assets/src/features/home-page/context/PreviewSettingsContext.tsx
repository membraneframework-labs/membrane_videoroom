import React, { createContext, useState } from "react";
import { DEFAULT_AUTOSTART_CAMERA_VALUE, DEFAULT_AUTOSTART_MICROPHONE_VALUE } from "../../../pages/room/consts";

export type PreviewSettings = {
  cameraAutostart: { status: boolean; setCameraAutostart: (status: boolean) => void };
  audioAutostart: { status: boolean; setAudioAutostart: (status: boolean) => void };
};

export const PreviewSettingsContext = createContext<PreviewSettings>({
  cameraAutostart: { status: false, setCameraAutostart: () => console.log("Error while creating context") },
  audioAutostart: { status: false, setAudioAutostart: () => console.log("Error while creating context") },
});

type Props = {
  children: React.ReactNode;
};

export const PreviewSettingsProvider = ({ children }: Props) => {
  const [cameraAutostart, setCameraAutostart] = useState<boolean>(DEFAULT_AUTOSTART_CAMERA_VALUE);
  const [audioAutostart, setAudioAutostart] = useState<boolean>(DEFAULT_AUTOSTART_MICROPHONE_VALUE);

  return (
    <PreviewSettingsContext.Provider
      value={{
        cameraAutostart: { status: cameraAutostart, setCameraAutostart },
        audioAutostart: { status: audioAutostart, setAudioAutostart },
      }}
    >
      {children}
    </PreviewSettingsContext.Provider>
  );
};
