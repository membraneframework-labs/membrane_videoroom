import { useEffect } from "react";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import { SimulcastQuality } from "./useSimulcastRemoteEncoding";

export const useRemoteEncodingClient = (
  webrtc: MembraneWebRTC,
  peerId: string,
  trackId: string,
  encoding: TrackEncoding
) => {
  useEffect(() => {
    webrtc.selectTrackEncoding(peerId, trackId, encoding);
  }, [webrtc, peerId, trackId, encoding]);
};
