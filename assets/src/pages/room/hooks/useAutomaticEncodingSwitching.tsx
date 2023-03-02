import { MembraneWebRTC, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { useCallback, useEffect, useState } from "react";
import { useResizeDetector } from "react-resize-detector";
import { useStoreFirstNonNullValue } from "./useStoreFirstNonNullValue";
import {
  MAX_TILE_HEIGHT_FOR_LOW_ENCODING,
  MAX_TILE_HEIGHT_FOR_MEDIUM_ENCODING,
  VIDEO_TILE_RESIZE_DETECTOR_DEBOUNCE_VALUE,
} from "../consts";
import { useSimulcastRemoteEncoding } from "./useSimulcastRemoteEncoding";

const getHighestAllowedEncoding = (height: number | null): TrackEncoding | null => {
  if (height === null) return null;
  if (height < MAX_TILE_HEIGHT_FOR_LOW_ENCODING) return "l";
  if (height < MAX_TILE_HEIGHT_FOR_MEDIUM_ENCODING) return "m";
  return "h";
};

const useCalculateSmartEncoding = (forceEncoding: TrackEncoding | null) => {
  const { height, ref } = useResizeDetector({
    refreshMode: "debounce",
    refreshRate: VIDEO_TILE_RESIZE_DETECTOR_DEBOUNCE_VALUE,
    handleWidth: false,
  });
  const tileSizeEncoding = getHighestAllowedEncoding(height || null);
  const smartEncoding: TrackEncoding | null = forceEncoding ?? tileSizeEncoding;

  return { ref, smartEncoding };
};

export const useAutomaticEncodingSwitching = (
  currentTrackEncoding: TrackEncoding | null,
  peerId: string | null,
  trackId: string | null,
  disableAutomaticLayerSwitching: boolean,
  autostartSmartLayerSwitching: boolean,
  forceEncoding: TrackEncoding | null,
  webrtc: MembraneWebRTC | null
) => {
  const [smartEncodingStatus, setSmartEncodingStatus] = useState(autostartSmartLayerSwitching);
  const onInitEncodingQuality = useStoreFirstNonNullValue(currentTrackEncoding || null);

  const { ref, smartEncoding } = useCalculateSmartEncoding(forceEncoding);

  const { setTargetEncoding, targetEncoding } = useSimulcastRemoteEncoding(peerId, trackId, webrtc);

  useEffect(() => {
    if (disableAutomaticLayerSwitching || !smartEncodingStatus || !onInitEncodingQuality || !smartEncoding) return;

    setTargetEncoding(smartEncoding);
  }, [
    disableAutomaticLayerSwitching,
    forceEncoding,
    onInitEncodingQuality,
    smartEncodingStatus,
    setTargetEncoding,
    smartEncoding,
  ]);

  const disableSmartAndSetTargetEncoding = useCallback(
    (encoding: TrackEncoding) => {
      setSmartEncodingStatus(false);
      setTargetEncoding(encoding);
    },
    [setTargetEncoding]
  );

  return {
    ref,
    setTargetEncoding: disableSmartAndSetTargetEncoding,
    targetEncoding,
    setSmartEncodingStatus,
    smartEncodingStatus,
    smartEncoding,
  };
};
