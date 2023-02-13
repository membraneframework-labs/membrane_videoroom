import { MembraneWebRTC, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { useCallback, useEffect, useState } from "react";
import { useResizeDetector } from "react-resize-detector";
import { useSimulcastRemoteEncoding } from "./useSimulcastRemoteEncoding";
import { useStoreFirstNonNullValue } from "./useStoreFirstNonNullValue";

const getHighestAllowedEncoding = (height: number | null): TrackEncoding | null => {
  if (height === null) return null;
  if (height < 250) return "l";
  if (height < 500) return "m";
  return "h";
};

type EncodingValue = 0 | 1 | 2;

const ENCODING_VALUE: Record<TrackEncoding, EncodingValue> = {
  l: 0,
  m: 1,
  h: 2,
};

const ENCODING_NAME: Record<EncodingValue, TrackEncoding> = {
  0: "l",
  1: "m",
  2: "h",
};

export const useAutomaticEncodingSwitching = (
  currentTrackEncoding: TrackEncoding | null,
  peerId: string | null,
  trackId: string | null,
  disableAutomaticLayerSwitching: boolean,
  disableQualityReduction: boolean,
  webrtc: MembraneWebRTC | null
) => {
  const onInitEncodingQuality = useStoreFirstNonNullValue(currentTrackEncoding || null);
  const [userSelectedEncoding, setUserSelectedEncoding] = useState<TrackEncoding | null>(null);

  const { height, ref } = useResizeDetector({ refreshMode: "debounce", refreshRate: 1000, handleWidth: false });
  const maxAutoEncoding = getHighestAllowedEncoding(height || null);

  const { targetEncoding, setTargetEncoding } = useSimulcastRemoteEncoding(peerId, trackId, webrtc);

  useEffect(() => {
    if (disableAutomaticLayerSwitching) return;
    if (!onInitEncodingQuality) return;
    if (!maxAutoEncoding) return;

    const automaticUpperBound: EncodingValue = disableQualityReduction
      ? ENCODING_VALUE.h
      : ENCODING_VALUE[maxAutoEncoding];
    const userUpperBound: EncodingValue = ENCODING_VALUE[userSelectedEncoding || "h"];
    const highestEncoding: EncodingValue = Math.min(automaticUpperBound, userUpperBound) as EncodingValue;
    const result: TrackEncoding = ENCODING_NAME[highestEncoding];

    if (targetEncoding === result) return;

    setTargetEncoding(result);
  }, [
    disableAutomaticLayerSwitching,
    disableQualityReduction,
    maxAutoEncoding,
    onInitEncodingQuality,
    setTargetEncoding,
    targetEncoding,
    userSelectedEncoding,
  ]);

  const setEncoding = useCallback(
    (encoding: TrackEncoding | null) => {
      if (encoding !== null) {
        setTargetEncoding(encoding);
      }
      setUserSelectedEncoding(encoding);
    },
    [setTargetEncoding, setUserSelectedEncoding]
  );

  return {
    ref,
    targetEncoding,
    setTargetEncoding: setEncoding,
    userSelectedEncoding,
  };
};
