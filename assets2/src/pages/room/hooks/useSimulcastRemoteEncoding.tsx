import { useCallback, useRef, useState } from "react";
import { MembraneWebRTC, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";

export type UseSimulcastRemoteEncodingResult = {
  targetEncoding: TrackEncoding | null;
  setTargetEncoding: (quality: TrackEncoding) => void;
};

export const useSimulcastRemoteEncoding = (
  peerId: string | null,
  trackId: string | null,
  webrtc: MembraneWebRTC | null
): UseSimulcastRemoteEncodingResult => {
  const [targetEncoding, setTargetEncodingState] = useState<TrackEncoding | null>(null);

  const lastSelectedEncoding = useRef<TrackEncoding | null>(null);
  const setTargetEncoding = useCallback(
    (encoding: TrackEncoding) => {
      if (lastSelectedEncoding.current === encoding) return;
      lastSelectedEncoding.current = encoding;
      setTargetEncodingState(encoding);

      if (!trackId || !peerId || !webrtc) return;
      webrtc.setTargetTrackEncoding(trackId, encoding);
    },
    [peerId, trackId, webrtc]
  );

  return { setTargetEncoding, targetEncoding };
};
