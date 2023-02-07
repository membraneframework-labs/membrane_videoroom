import type { Callbacks, MembraneWebRTC, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import type TypedEmitter from "typed-emitter";
import type { Channel, Socket } from "phoenix";
import type { StoreApi } from "./storeApi";
import { SetStore } from "./externalState/externalState";

export type TrackId = string;
export type PeerId = string;
export type Tracks<Metadata> = Record<TrackId, LibraryTrack<Metadata>>;

export type LibrarySimulcastConfig = {
  enabled: boolean | null;
  activeEncodings: TrackEncoding[];
};

export type LibraryTrack<TrackMetadataGeneric> = {
  stream: MediaStream | null;
  encoding: TrackEncoding | null;
  trackId: TrackId;
  metadata: TrackMetadataGeneric | null; // eslint-disable-line @typescript-eslint/no-explicit-any
  simulcastConfig: LibrarySimulcastConfig | null;
  track: MediaStreamTrack | null;
};

export type LibraryLocalPeer<PeerMetadataGeneric, TrackMetadataGeneric> = {
  id: PeerId | null;
  metadata: PeerMetadataGeneric | null;
  tracks: Record<TrackId, LibraryTrack<TrackMetadataGeneric>>;
};

export type LibraryRemotePeer<PeerMetadataGeneric, TrackMetadataGeneric> = {
  id: PeerId;
  metadata: PeerMetadataGeneric | null;
  tracks: Record<TrackId, LibraryTrack<TrackMetadataGeneric>>;
};

export type Connectivity<PeerMetadataGeneric, TrackMetadataGeneric> = {
  socket: Socket | null;
  signaling: Channel | null;
  webrtc: MembraneWebRTC | null;
  api: StoreApi<TrackMetadataGeneric> | null;
  connect: ((roomId: string, peerMetadata: PeerMetadataGeneric, isSimulcastOn: boolean) => () => void) | null;
};

export type LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric> = {
  local: LibraryLocalPeer<PeerMetadataGeneric, TrackMetadataGeneric>;
  remote: Record<PeerId, LibraryRemotePeer<PeerMetadataGeneric, TrackMetadataGeneric>>;
  status: "connecting" | "connected" | "error" | null,
  connectivity: Connectivity<PeerMetadataGeneric, TrackMetadataGeneric>;
};

// --- selectors
export type Selector<PeerM, TrackM, Result> = (snapshot: LibraryPeersState<PeerM, TrackM> | null) => Result;

// todo remove
export type LibraryTrackMinimal = {
  stream: MediaStream | null;
  trackId: TrackId;
  track: MediaStreamTrack | null;
  simulcastConfig: LibrarySimulcastConfig | null;
};

export type ConnectionStatus = "before-connection" | "connected" | "connecting" | "error";

export type UseMembraneClientType<PeerMetadataGeneric, TrackMetadataGeneric> = {
  webrtc?: MembraneWebRTC;
  messageEmitter?: TypedEmitter<Partial<Callbacks>>;
  signaling?: Channel;
  webrtcConnectionStatus?: ConnectionStatus;
  signalingStatus?: ConnectionStatus;
  // store: Store<PeerMetadataGeneric, TrackMetadataGeneric>;
  api: StoreApi<TrackMetadataGeneric> | null;
};
