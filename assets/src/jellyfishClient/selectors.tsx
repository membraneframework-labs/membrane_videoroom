import type { State, Selector, PeerId, TrackId } from "./state.types";
import type { Connectivity } from "./state.types";

export const fullState = <PeerMetadata, TrackMetadata>(
  snapshot: State<PeerMetadata, TrackMetadata>
): State<PeerMetadata, TrackMetadata> => snapshot;

type CreateFullStateSelector = <PeerM, TrackM>() => Selector<PeerM, TrackM, State<PeerM, TrackM>>;
export const createFullStateSelector: CreateFullStateSelector =
  <PeerM, TrackM>(): Selector<PeerM, TrackM, State<PeerM, TrackM>> =>
  (snapshot: State<PeerM, TrackM>): State<PeerM, TrackM> =>
    snapshot;

type CreateIsConnectedSelector = <PeerM, TrackM>() => Selector<PeerM, TrackM, boolean>;
export const createIsConnectedSelector: CreateIsConnectedSelector =
  <PeerM, TrackM>(): Selector<PeerM, TrackM, boolean> =>
  (snapshot: State<PeerM, TrackM>): boolean =>
    !!snapshot.local?.id || false;

type CreateLocalPeerIdsSelector = <PeerM, TrackM>() => Selector<PeerM, TrackM, PeerId | null>;
export const createLocalPeerIdsSelector: CreateLocalPeerIdsSelector =
  <PeerM, TrackM>(): Selector<PeerM, TrackM, PeerId | null> =>
  (snapshot: State<PeerM, TrackM>): PeerId | null =>
    snapshot.local?.id || null;

type CreatePeerIdsSelector = <PeerM, TrackM>() => Selector<PeerM, TrackM, Array<PeerId>>;
export const createPeerIdsSelector: CreatePeerIdsSelector =
  <PeerM, TrackM>(): Selector<PeerM, TrackM, Array<PeerId>> =>
  (snapshot: State<PeerM, TrackM>): Array<PeerId> =>
    Object.keys(snapshot.remote || {});

type CreateTracksIdsSelector = <PeerM, TrackM>(peerId: PeerId) => Selector<PeerM, TrackM, Array<TrackId>>;
export const createTracksIdsSelector: CreateTracksIdsSelector =
  <PeerM, TrackM>(peerId: string): Selector<PeerM, TrackM, Array<PeerId>> =>
  (snapshot: State<PeerM, TrackM>): Array<TrackId> =>
    Object.values(snapshot.remote[peerId]?.tracks || {}).map((track) => track.trackId);

type CreateLocalTracksIdsSelector = <PeerM, TrackM>() => Selector<PeerM, TrackM, Array<TrackId>>;
export const createLocalTracksIdsSelector: CreateLocalTracksIdsSelector =
  <PeerM, TrackM>(): Selector<PeerM, TrackM, Array<PeerId>> =>
  (snapshot: State<PeerM, TrackM>): Array<TrackId> =>
    Object.values(snapshot.local?.tracks || {}).map((track) => track.trackId);

// todo make generic
type CreateTrackMetadataSelector = <PeerM, TrackM>(peerId: PeerId, trackId: TrackId) => Selector<PeerM, TrackM, object>;
export const createTrackMetadataSelector: CreateTrackMetadataSelector =
  <PeerM, TrackM>(peerId: string, trackId: string): Selector<PeerM, TrackM, object> =>
  (snapshot: State<PeerM, TrackM>): object =>
    snapshot?.remote[peerId].tracks[trackId]?.metadata || {};

type CreateApiSelector = <PeerM, TrackM>() => Selector<PeerM, TrackM, Connectivity<PeerM, TrackM>>;
export const createConnectivitySelector: CreateApiSelector =
  <PeerM, TrackM>(): Selector<PeerM, TrackM, Connectivity<PeerM, TrackM>> =>
  (snapshot: State<PeerM, TrackM>): Connectivity<PeerM, TrackM> =>
    snapshot.connectivity || { webrtc: null, signaling: null, socket: null, api: null, connect: null };

// with memo
// export const useCreateLocalPeerIdsSelector = <P, T>(): (snapshot: (LibraryPeersState<P, T> | null)) => (string | null) => {
//   const useMemo1: (snapshot: (LibraryPeersState<P, T> | null)) => (string | null) = useMemo(() => {
//     console.log("%c memo!", "color: blue")
//     return createLocalPeerIdsSelector();
//   }, []);
//   return useMemo1
// }
