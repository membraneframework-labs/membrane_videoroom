import type { LibraryPeersState, Selector, LibraryTrackMinimal, PeerId, TrackId } from "./types";

type S<PeerM, TrackM> = LibraryPeersState<PeerM, TrackM>;

type CreateFullStateSelector = <PeerM, TrackM>() => Selector<PeerM, TrackM, LibraryPeersState<PeerM, TrackM> | null>;
export const createFullStateSelector: CreateFullStateSelector =
  <PeerM, TrackM>(): Selector<PeerM, TrackM, LibraryPeersState<PeerM, TrackM> | null> =>
  (snapshot: LibraryPeersState<PeerM, TrackM> | null): LibraryPeersState<PeerM, TrackM> | null =>
    snapshot || null;

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

// todo make generic
type CreateTrackMetadataSelector = <PeerM, TrackM>(peerId: PeerId, trackId: TrackId) => Selector<PeerM, TrackM, object>;
export const createTrackMetadataSelector: CreateTrackMetadataSelector =
  <PeerM, TrackM>(peerId: string, trackId: string): Selector<PeerM, TrackM, object> =>
  (snapshot: LibraryPeersState<PeerM, TrackM> | null): object =>
    snapshot?.remote[peerId]?.tracks[trackId]?.metadata || {};
