import { Callbacks, MembraneWebRTC, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import TypedEmitter from "typed-emitter";
import { Channel, Socket } from "phoenix";
import { storeApi } from "./storeApi";

export type TrackId = string;
export type PeerId = string;
export type Tracks<Metadata> = Record<TrackId, LibraryTrack<Metadata>>;

export type LibrarySimulcastConfig = {
  enabled: boolean | null;
  activeEncodings: TrackEncoding[];
};

export type LibraryTrack<TrackMetadataGeneric> = {
  stream: MediaStream | null;
  encoding: TrackEncoding | null,
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

export type Connectivity<TrackMetadataGeneric> = {
  socket: Socket | null;
  signaling: Channel | null;
  webrtc: MembraneWebRTC | null;
  api: storeApi<TrackMetadataGeneric> | null
};

export type LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric> = {
  local: LibraryLocalPeer<PeerMetadataGeneric, TrackMetadataGeneric>;
  remote: Record<PeerId, LibraryRemotePeer<PeerMetadataGeneric, TrackMetadataGeneric>>;
  connectivity: Connectivity<TrackMetadataGeneric>;
};

// --- selectors
export type Selector<PeerM, TrackM, Result> = (snapshot: LibraryPeersState<PeerM, TrackM> | null) => Result;

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
  api: storeApi<TrackMetadataGeneric> | null;
};
