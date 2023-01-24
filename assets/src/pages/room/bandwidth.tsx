import { BandwidthLimit, SimulcastBandwidthLimit, TrackBandwidthLimit } from "@jellyfish-dev/membrane-webrtc-js";
import type { TrackType } from "../types";

const NO_LIMIT: BandwidthLimit = 0;
const DEFAULT_LIMIT: BandwidthLimit = 1500;
const SIMULCAST_BANDWIDTH_LIMITS: SimulcastBandwidthLimit = new Map([
  ["h", 1500],
  ["m", 500],
  ["l", 100],
]);

export const selectBandwidthLimit = (type: TrackType, simulcast: boolean): TrackBandwidthLimit => {
  if (type === "audio") return NO_LIMIT;
  if (simulcast) return SIMULCAST_BANDWIDTH_LIMITS;
  return DEFAULT_LIMIT;
};
