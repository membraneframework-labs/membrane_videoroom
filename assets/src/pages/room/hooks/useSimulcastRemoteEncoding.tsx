import { useCallback, useState } from "react";
import { MembraneWebRTC, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";

export type UseSimulcastRemoteEncodingResult = {
  targetEncoding: TrackEncoding | null;
  setTargetEncoding: (quality: TrackEncoding) => void;
};

export const useSimulcastRemoteEncoding = (
  peerId: string | null,
  videoTrackId: string | null,
  webrtc: MembraneWebRTC | null
): UseSimulcastRemoteEncodingResult => {
  const [targetEncoding, setTargetEncodingState] = useState<TrackEncoding | null>(null);

  const setTargetEncoding = useCallback(
    (quality: TrackEncoding) => {
      if (targetEncoding === quality) return;

      setTargetEncodingState(() => quality);
      console.log("Changing encoding to: " + quality);

      if (!videoTrackId || !peerId || !webrtc) return;
      webrtc.setTargetTrackEncoding(videoTrackId, quality);
    },
    [peerId, targetEncoding, videoTrackId, webrtc]
  );

  return { setTargetEncoding, targetEncoding };
};
