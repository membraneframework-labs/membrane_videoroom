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

  const setTargetEncodingOnServer = useCallback(
    (quality: TrackEncoding) => {
      if (!videoTrackId || !peerId || !webrtc) return;
      webrtc.setTargetTrackEncoding(videoTrackId, quality);
    },
    [videoTrackId, peerId, webrtc]
  );

  const setTargetEncoding = useCallback(
    (quality: TrackEncoding) => {
      setTargetEncodingState(() => quality);
      setTargetEncodingOnServer(quality);
    },
    [setTargetEncodingOnServer]
  );

  return { setTargetEncoding, targetEncoding };
};
