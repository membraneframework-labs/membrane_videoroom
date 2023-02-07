import { MembraneStreaming, StreamingMode, useMembraneMediaStreaming } from "./useLibraryMembraneMediaStreaming";
import { DisplayMediaStreamConfig, MediaStreamConfig, useMedia, LocalMedia } from "../pages/room/hooks/useMedia";
import { TrackType } from "../pages/types";

export type Streams = {
  remote: MembraneStreaming;
  local: LocalMedia;
};

export const useLibraryStreamManager = (
  type: TrackType,
  mode: StreamingMode,
  isConnected: boolean,
  simulcast: boolean,
  config: MediaStreamConfig | DisplayMediaStreamConfig,
  autostartStreaming?: boolean
): Streams => {
  const localMedia: LocalMedia = useMedia(config, autostartStreaming);
  const membraneStreaming: MembraneStreaming = useMembraneMediaStreaming(
    mode,
    type,
    isConnected,
    simulcast,
    localMedia.stream || null,
  );

  return { local: localMedia, remote: membraneStreaming };
};
