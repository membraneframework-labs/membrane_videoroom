import React, { createContext, useContext } from "react";
import {
  MembraneStreaming,
  StreamingMode,
  useMembraneMediaStreaming,
} from "../../pages/room/hooks/useMembraneMediaStreaming";
import { useSelector } from "../../jellifish.types";
import { useDeveloperInfo } from "../../contexts/DeveloperInfoContext";
import { useLocalPeer } from "../devices/LocalPeerMediaContext";

export type StreamingContext = {
  camera: MembraneStreaming;
  microphone: MembraneStreaming;
  screenShare: MembraneStreaming;
};

const StreamingContext = createContext<StreamingContext | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export const StreamingProvider = ({ children }: Props) => {
  const { manualMode } = useDeveloperInfo();
  const mode: StreamingMode = manualMode.status ? "manual" : "automatic";
  const isConnected = useSelector((snapshot) => snapshot.status === "joined");
  const { video, audio, screenShare: screenShareMedia } = useLocalPeer();

  const camera = useMembraneMediaStreaming(mode, "camera", isConnected, video.device);
  const microphone = useMembraneMediaStreaming(mode, "audio", isConnected, audio.device);
  const screenShare = useMembraneMediaStreaming(mode, "screensharing", isConnected, screenShareMedia.device);

  return <StreamingContext.Provider value={{ camera, microphone, screenShare }}>{children}</StreamingContext.Provider>;
};

export const useStreaming = (): StreamingContext => {
  const context = useContext(StreamingContext);
  if (!context) throw new Error("useStreaming must be used within a StreamingProvider");
  return context;
};
