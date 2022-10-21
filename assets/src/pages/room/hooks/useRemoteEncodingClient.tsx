import { useEffect } from "react";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import { SimulcastQuality } from "./useSimulcastRemoteEncoding";

export const useRemoteEncodingClient = (
  webrtc: MembraneWebRTC,
  peerId: string,
  trackId: string,
  encoding: SimulcastQuality
) => {
  useEffect(() => {
    webrtc.selectTrackEncoding(peerId, trackId, encoding);
  }, [webrtc, peerId, trackId, encoding]);
};
