import type { MembraneStreaming, StreamingMode} from "./useLibraryMembraneMediaStreaming";
import { useMembraneMediaStreaming } from "./useLibraryMembraneMediaStreaming";
import type { DisplayMediaStreamConfig, MediaStreamConfig, LocalMedia } from "../pages/room/hooks/useMedia";
import { useMedia } from "../pages/room/hooks/useMedia";
import type { TrackType } from "../pages/types";

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
