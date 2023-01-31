import { MembraneStreaming, StreamingMode, useMembraneMediaStreaming } from "./useMembraneMediaStreaming";
import { useSetLocalUserTrack } from "./useSetLocalUserTrack";
import { useSetRemoteTrackId } from "./useSetRemoteTrackId";
import { useSetLocalTrackMetadata } from "./useSetLocalTrackMetadata";
import { MembraneWebRTC } from "@jellyfish-dev/membrane-webrtc-js";
import { DisplayMediaStreamConfig, MediaStreamConfig, useMedia, LocalMedia } from "./useMedia";
import { PeersApi } from "./usePeerState";
import { TrackType } from "../../types";

export type Streams = {
  remote: MembraneStreaming;
  local: LocalMedia;
};

export const useStreamManager = (
  type: TrackType,
  mode: StreamingMode,
  isConnected: boolean,
  simulcast: boolean,
  webrtc: MembraneWebRTC | undefined,
  config: MediaStreamConfig | DisplayMediaStreamConfig,
  peersApi: PeersApi,
  autostartStreaming?: boolean
): Streams => {
  const local = useMedia(config, autostartStreaming);
  const remote = useMembraneMediaStreaming(mode, type, isConnected, simulcast, webrtc, local.stream);
  useSetLocalUserTrack(type, peersApi, local.stream, local.isEnabled);
  useSetRemoteTrackId(type, remote.trackId, peersApi); // do kopiowania z serva na local
  useSetLocalTrackMetadata(type, peersApi, remote.trackMetadata); // do kopiowanie remote track metadata

  return { local, remote };
};
