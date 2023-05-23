import { useCallback, useRef, useState } from "react";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { useApi } from "../../../jellifish.types";

export type UseSimulcastRemoteEncodingResult = {
  targetEncoding: TrackEncoding | null;
  setTargetEncoding: (quality: TrackEncoding) => void;
};

export const useSimulcastRemoteEncoding = (
  peerId: string | null,
  trackId: string | null
  // webrtc: MembraneWebRTC | null
): UseSimulcastRemoteEncodingResult => {
  const [targetEncoding, setTargetEncodingState] = useState<TrackEncoding | null>(null);

  const api = useApi();

  const lastSelectedEncoding = useRef<TrackEncoding | null>(null);
  const setTargetEncoding = useCallback(
    (encoding: TrackEncoding) => {
      if (lastSelectedEncoding.current === encoding) return;
      lastSelectedEncoding.current = encoding;
      setTargetEncodingState(encoding);

      if (!trackId || !peerId || !api) return;
      api.setTargetTrackEncoding(trackId, encoding);
    },
    [peerId, trackId, api]
  );

  return { setTargetEncoding, targetEncoding };
};
