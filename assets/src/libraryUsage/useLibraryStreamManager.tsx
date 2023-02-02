import { MembraneStreaming, StreamingMode, useMembraneMediaStreaming } from "./useLibraryMembraneMediaStreaming";
import { DisplayMediaStreamConfig, MediaStreamConfig, useMedia, LocalMedia } from "../pages/room/hooks/useMedia";
import { TrackType } from "../pages/types";
// import { useSetLocalUserTrack } from "./useLibrarySetLocalUserTrack";
// import { useSetRemoteTrackId } from "./useLibrarySetRemoteTrackId";
// import { useSetLocalTrackMetadata } from "./useLibrarySetLocalTrackMetadata";
import { UseMembraneClientType } from "../library/state.types";
import { PeerMetadata, TrackMetadata } from "./types";
import {useSelector2} from "./setup";

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
  // useSetLocalUserTrack(type, , localMedia.stream, localMedia.isEnabled);
  // useSetRemoteTrackId(type, peersApi.setLocalTrackId, remote.trackId);
  // useSetLocalTrackMetadata(type, peersApi.setLocalTrackMetadata, remote.trackMetadata);

  return { local: localMedia, remote: membraneStreaming };
};
