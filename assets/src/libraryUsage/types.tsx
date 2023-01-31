import { TrackType } from "../pages/types";

export type PeerMetadata = {
  emoji?: string;
  displayName?: string;
};
export type TrackMetadata = {
  type?: TrackType;
  active?: boolean;
};
