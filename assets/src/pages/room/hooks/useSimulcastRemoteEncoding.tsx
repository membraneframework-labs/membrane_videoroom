import { useCallback, useState } from "react";
import { MembraneWebRTC, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { useSelector } from "../../../libraryUsage/setup";
import { createConnectivitySelector } from "../../../library/selectors";

export type UseSimulcastRemoteEncodingResult = {
  desiredEncoding: TrackEncoding;
  setDesiredEncoding: (quality: TrackEncoding) => void;
};

export const useSimulcastRemoteEncoding = (
  defaultValue: TrackEncoding,
  peerId: string | null,
  videoTrackId: string | null
  // webrtc: MembraneWebRTC | null
): UseSimulcastRemoteEncodingResult => {
  const api = useSelector(createConnectivitySelector());

  const [desiredEncoding, setDesiredEncodingState] = useState<TrackEncoding>(defaultValue);

  const selectRemoteEncoding = useCallback(
    (quality: TrackEncoding) => {
      if (!videoTrackId || !peerId) return;
      console.log("Changing! desired encoding to: " + quality);
      api?.api?.setTargetTrackEncoding(videoTrackId, quality);
    },
    [videoTrackId, peerId]
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
