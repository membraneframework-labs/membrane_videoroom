import type { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import type { Api } from "./api";
import { VadStatus } from "@jellyfish-dev/membrane-webrtc-js/dist/membraneWebRTC";
import { JellyfishClient } from "./JellyfishClient";

export type TrackId = string;
export type PeerId = string;

export type SimulcastConfig = {
  enabled: boolean | null;
  activeEncodings: TrackEncoding[];
};

export type Track<TrackMetadata> = {
  stream: MediaStream | null;
  encoding: TrackEncoding | null;
  trackId: TrackId;
  metadata: TrackMetadata | null; // eslint-disable-line @typescript-eslint/no-explicit-any
  simulcastConfig: SimulcastConfig | null;
  vadStatus: VadStatus;
  track: MediaStreamTrack | null;
};

export type Peer<PeerMetadata, TrackMetadata> = {
  id: PeerId;
  metadata: PeerMetadata | null;
  tracks: Record<TrackId, Track<TrackMetadata>>;
};

export type Connectivity<PeerMetadata, TrackMetadata> = {
  api: Api<TrackMetadata> | null;
  client: JellyfishClient<PeerMetadata, TrackMetadata> | null;
};

export type PeerStatus = "connecting" | "connected" | "authenticated" | "joined" | "error" | null;
export type State<PeerMetadata, TrackMetadata> = {
  local: Peer<PeerMetadata, TrackMetadata> | null;
  remote: Record<PeerId, Peer<PeerMetadata, TrackMetadata>>;
  bandwidthEstimation: bigint;
  status: PeerStatus;
  connectivity: Connectivity<PeerMetadata, TrackMetadata>;
};

export type SetStore<PeerMetadata, TrackMetadata> = (
  setter: (prevState: State<PeerMetadata, TrackMetadata>) => State<PeerMetadata, TrackMetadata>
) => void;

export type Selector<PeerMetadata, TrackMetadata, Result> = (snapshot: State<PeerMetadata, TrackMetadata>) => Result;
