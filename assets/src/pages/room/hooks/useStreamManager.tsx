import { MembraneStreaming, StreamingMode, useMembraneMediaStreaming } from "./useMembraneMediaStreaming";
import { useSetLocalUserTrack } from "./useSetLocalUserTrack";
import { useSetRemoteTrackId } from "./useSetRemoteTrackId";
import { useSetLocalTrackMetadata } from "./useSetLocalTrackMetadata";
import { MembraneWebRTC } from "@jellyfish-dev/membrane-webrtc-js";
import { PeersApi } from "./usePeerState";
import { TrackType } from "../../types";
import { Device } from "../../../features/devices/LocalPeerMediaContext";

export type Streams = {
  remote: MembraneStreaming;
  local: Device;
};

export const useStreamManager = (
  type: TrackType,
  mode: StreamingMode,
  isConnected: boolean,
  simulcast: boolean,
  // webrtc: MembraneWebRTC | null,
  // peersApi: PeersApi,
  local: Device
): Streams => {
  const isEnabled = local.isEnabled;
  const stream = local.stream;
  const remote = useMembraneMediaStreaming(mode, type, isConnected, simulcast, stream, isEnabled);
  // useSetLocalUserTrack(type, peersApi, stream, isEnabled);
  // useSetRemoteTrackId(type, remote.trackId, peersApi);
  // useSetLocalTrackMetadata(type, peersApi, remote.trackMetadata);

  return { remote, local };
};
