import React from "react";
import { MembraneStreaming, StreamingMode, useMembraneMediaStreaming } from "./useMembraneMediaStreaming";
import { useSetLocalUserTrack } from "./useSetLocalUserTrack";
import { useSetRemoteTrackId } from "./useSetRemoteTrackId";
import { useSetLocalTrackMetadata } from "./useSetLocalTrackMetadata";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import { DisplayMediaStreamConfig, MediaStreamConfig, useMediaMedia, UseMediaResult } from "./useUserMedia";
import { PeersApi } from "./usePeerState";
import { TrackType } from "../../types";

export type Streams = {
  remote: MembraneStreaming;
  local: UseMediaResult;
};

export const useStreamManager = (
  type: TrackType,
  mode: StreamingMode,
  isConnected: boolean,
  webrtc: MembraneWebRTC | undefined,
  config: MediaStreamConfig | DisplayMediaStreamConfig,
  peersApi: PeersApi
): Streams => {
  const local = useMediaMedia(config, false);
  const remote = useMembraneMediaStreaming(mode, type, isConnected, webrtc, local.stream);
  useSetLocalUserTrack(type, peersApi, local.stream, local.isEnabled);
  useSetRemoteTrackId(type, remote.tracksId, peersApi);
  useSetLocalTrackMetadata(type, peersApi, remote.trackMetadata);

  return { local, remote };
};
