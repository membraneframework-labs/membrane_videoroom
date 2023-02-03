import type { LibraryPeersState, Selector, LibraryTrackMinimal, PeerId, TrackId } from "./state.types";
import { Connectivity } from "./state.types";

type S<PeerM, TrackM> = LibraryPeersState<PeerM, TrackM>;

type CreateFullStateSelector = <PeerM, TrackM>() => Selector<PeerM, TrackM, LibraryPeersState<PeerM, TrackM> | null>;
export const createFullStateSelector: CreateFullStateSelector =
  <PeerM, TrackM>(): Selector<PeerM, TrackM, LibraryPeersState<PeerM, TrackM> | null> =>
  (snapshot: LibraryPeersState<PeerM, TrackM> | null): LibraryPeersState<PeerM, TrackM> | null =>
    snapshot || null;

type CreateIsConnectedSelector = <PeerM, TrackM>() => Selector<PeerM, TrackM, boolean>;
export const createIsConnectedSelector: CreateIsConnectedSelector =
    <PeerM, TrackM>(): Selector<PeerM, TrackM, boolean> =>
        (snapshot: LibraryPeersState<PeerM, TrackM> | null): boolean =>
            !!snapshot?.local?.id || false;


type CreateLocalPeerIdsSelector = <PeerM, TrackM>() => Selector<PeerM, TrackM, PeerId | null>;
export const createLocalPeerIdsSelector: CreateLocalPeerIdsSelector =
  <PeerM, TrackM>(): Selector<PeerM, TrackM, PeerId | null> =>
  (snapshot: LibraryPeersState<PeerM, TrackM> | null): PeerId | null =>
    snapshot?.local?.id || null;

type CreatePeerIdsSelector = <PeerM, TrackM>() => Selector<PeerM, TrackM, Array<PeerId>>;
export const createPeerIdsSelector: CreatePeerIdsSelector =
  <PeerM, TrackM>(): Selector<PeerM, TrackM, Array<PeerId>> =>
  (snapshot: LibraryPeersState<PeerM, TrackM> | null): Array<PeerId> =>
    Object.keys(snapshot?.remote || {});

type CreateTracksIdsSelector = <PeerM, TrackM>(peerId: PeerId) => Selector<PeerM, TrackM, Array<TrackId>>;
export const createTracksIdsSelector: CreateTracksIdsSelector =
  <PeerM, TrackM>(peerId: string): Selector<PeerM, TrackM, Array<PeerId>> =>
  (snapshot: LibraryPeersState<PeerM, TrackM> | null): Array<TrackId> =>
    Object.values(snapshot?.remote[peerId]?.tracks || {}).map((track) => track.trackId);

type CreateLocalTracksIdsSelector = <PeerM, TrackM>() => Selector<PeerM, TrackM, Array<TrackId>>;
export const createLocalTracksIdsSelector: CreateLocalTracksIdsSelector =
  <PeerM, TrackM>(): Selector<PeerM, TrackM, Array<PeerId>> =>
  (snapshot: LibraryPeersState<PeerM, TrackM> | null): Array<TrackId> =>
    Object.values(snapshot?.local?.tracks || {}).map((track) => track.trackId);

type CreateTracksSelector = <PeerM, TrackM>(peerId: PeerId) => Selector<PeerM, TrackM, Array<LibraryTrackMinimal>>;
export const createTracksSelector: CreateTracksSelector =
  <PeerM, TrackM>(peerId: PeerId): Selector<PeerM, TrackM, Array<LibraryTrackMinimal>> =>
  (snapshot: LibraryPeersState<PeerM, TrackM> | null): Array<LibraryTrackMinimal> =>
    Object.values(snapshot?.remote[peerId]?.tracks || {}).map((track) => ({
      trackId: track.trackId,
      simulcastConfig: track.simulcastConfig ? { ...track.simulcastConfig } : null,
      stream: track.stream,
      track: track.track,
    }));

type CreateLocalTracksSelector = <PeerM, TrackM>() => Selector<PeerM, TrackM, Array<LibraryTrackMinimal>>;
export const createLocalTracksSelector: CreateLocalTracksSelector =
  <PeerM, TrackM>(): Selector<PeerM, TrackM, Array<LibraryTrackMinimal>> =>
  (snapshot: LibraryPeersState<PeerM, TrackM> | null): Array<LibraryTrackMinimal> =>
    Object.values(snapshot?.local?.tracks || {}).map((track) => ({
      trackId: track.trackId,
      simulcastConfig: track.simulcastConfig ? { ...track.simulcastConfig } : null,
      stream: track.stream,
      track: track.track,
    }));

// todo make generic
type CreateTrackMetadataSelector = <PeerM, TrackM>(peerId: PeerId, trackId: TrackId) => Selector<PeerM, TrackM, object>;
export const createTrackMetadataSelector: CreateTrackMetadataSelector =
  <PeerM, TrackM>(peerId: string, trackId: string): Selector<PeerM, TrackM, object> =>
  (snapshot: LibraryPeersState<PeerM, TrackM> | null): object =>
    snapshot?.remote[peerId]?.tracks[trackId]?.metadata || {};

type CreateApiSelector = <PeerM, TrackM>() => Selector<PeerM, TrackM, Connectivity<TrackM>>;
export const createConnectivitySelector: CreateApiSelector =
  <PeerM, TrackM>(): Selector<PeerM, TrackM, Connectivity<TrackM>> =>
  (snapshot: LibraryPeersState<PeerM, TrackM> | null): Connectivity<TrackM> =>
    snapshot?.connectivity || { webrtc: null, signaling: null, socket: null, api: null };