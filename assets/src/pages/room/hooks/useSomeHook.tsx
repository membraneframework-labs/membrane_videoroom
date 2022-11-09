import React from "react";
import { MembraneStreaming, StreamingMode, useMembraneMediaStreaming } from "./useMembraneMediaStreaming";
import { useSetLocalUserTrack } from "./useSetLocalUserTrack";
import { useSetRemoteTrackId } from "./useSetRemoteTrackId";
import { useSetLocalTrackMetadata } from "./useSetLocalTrackMetadata";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import { UseMediaResult } from "./useUserMedia";
import { PeersApi } from "./usePeerState";
import { TrackType } from "../../types";

export const useSomeHook = (
  type: TrackType,
  mode: StreamingMode,
  isConnected: boolean,
  webrtc: MembraneWebRTC | undefined,
  userMediaVideo: UseMediaResult,
  peersApi: PeersApi
): MembraneStreaming => {
  const cameraStreaming: MembraneStreaming = useMembraneMediaStreaming(
    mode,
    type,
    isConnected,
    webrtc,
    userMediaVideo.stream
  );

  useSetLocalUserTrack(type, peersApi, userMediaVideo.stream, userMediaVideo.isEnabled);
  useSetRemoteTrackId(type, cameraStreaming.tracksId, peersApi);
  useSetLocalTrackMetadata(type, peersApi, cameraStreaming.trackMetadata);

  return cameraStreaming;
};
