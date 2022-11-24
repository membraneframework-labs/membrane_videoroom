import { useCallback, useState } from "react";
import { MembraneWebRTC, TrackEncoding } from "@membraneframework/membrane-webrtc-js";

export type UseSimulcastRemoteEncodingResult = {
  desiredEncoding: TrackEncoding;
  setDesiredEncoding: (quality: TrackEncoding) => void;
};

export const useSimulcastRemoteEncoding = (
  defaultValue: TrackEncoding,
  peerId?: string,
  videoTrackId?: string,
  webrtc?: MembraneWebRTC
): UseSimulcastRemoteEncodingResult => {
  const [desiredEncoding, setDesiredEncodingState] = useState<TrackEncoding>(defaultValue);

  const selectRemoteEncoding = useCallback(
    (quality: TrackEncoding) => {
      if (!videoTrackId || !peerId || !webrtc) return;
      webrtc.setTargetTrackEncoding(videoTrackId, quality);
    },
    [videoTrackId, peerId, webrtc]
  );

  const setDesiredEncoding = useCallback(
    (quality: TrackEncoding) => {
      setDesiredEncodingState(() => quality);
      selectRemoteEncoding(quality);
    },
    [selectRemoteEncoding]
  );

  return { setDesiredEncoding, desiredEncoding };
};
