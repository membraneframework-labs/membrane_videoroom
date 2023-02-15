import { MembraneWebRTC, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { useEffect, useState } from "react";
import { useResizeDetector } from "react-resize-detector";
import { useSimulcastRemoteEncoding } from "./useSimulcastRemoteEncoding";
import { useStoreFirstNonNullValue } from "./useStoreFirstNonNullValue";
import {
  MAX_TILE_HEIGHT_FOR_LOW_ENCODING,
  MAX_TILE_HEIGHT_FOR_MEDIUM_ENCODING,
  VIDEO_TILE_RESIZE_DETECTOR_DEBOUNCE_VALUE
} from "../consts";

const getHighestAllowedEncoding = (height: number | null): TrackEncoding | null => {
  if (height === null) return null;
  if (height < MAX_TILE_HEIGHT_FOR_LOW_ENCODING) return "l";
  if (height < MAX_TILE_HEIGHT_FOR_MEDIUM_ENCODING) return "m";
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
  const [userSelectedEncoding, setUserSelectedEncoding] = useState<TrackEncoding | "auto">("auto");

  const { height, ref } = useResizeDetector({ refreshMode: "debounce", refreshRate: VIDEO_TILE_RESIZE_DETECTOR_DEBOUNCE_VALUE, handleWidth: false });
  const maxAutoEncoding = getHighestAllowedEncoding(height || null);

  const { targetEncoding, setTargetEncoding } = useSimulcastRemoteEncoding(peerId, trackId, webrtc);

  useEffect(
    () => {
      if (disableAutomaticLayerSwitching) return;
      if (!onInitEncodingQuality) return;
      if (!maxAutoEncoding) return;

      const automaticUpperBound: EncodingValue = disableQualityReduction
        ? ENCODING_VALUE.h
        : ENCODING_VALUE[maxAutoEncoding];
      const userUpperBound: EncodingValue =
        ENCODING_VALUE[userSelectedEncoding === "auto" ? "h" : userSelectedEncoding];
      const highestEncoding: EncodingValue = Math.min(automaticUpperBound, userUpperBound) as EncodingValue;
      const result: TrackEncoding = ENCODING_NAME[highestEncoding];

      setTargetEncoding(result);
    },
    // Exhaustive-deps is disabled because this hook should not react to setTargetEncoding change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      disableAutomaticLayerSwitching,
      disableQualityReduction,
      maxAutoEncoding,
      onInitEncodingQuality,
      userSelectedEncoding,
    ]
  );

  return {
    ref,
    targetEncoding,
    setTargetEncoding,
    userSelectedEncoding,
    setUserSelectedEncoding,
  };
};
