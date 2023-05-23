const TrackTypeValues = ["screensharing", "camera", "audio"] as const;
export type TrackType = (typeof TrackTypeValues)[number];
import { create } from "@jellyfish-dev/react-client-sdk";

export type PeerMetadata = {
  name: string;
};
export type TrackMetadata = {
  type: TrackType;
  active: boolean;
};

export const { useSelector, useConnect, JellyfishContextProvider } = create<PeerMetadata, TrackMetadata>();
