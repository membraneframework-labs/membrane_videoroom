import { MembraneStreaming, StreamingMode, useMembraneMediaStreaming } from "./useMembraneMediaStreaming";
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
  const remote = useMembraneMediaStreaming(mode, type, isConnected, simulcast, local.stream, local.isEnabled);

  return { remote, local };
};
