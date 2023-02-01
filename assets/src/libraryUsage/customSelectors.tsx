import { TrackType } from "../pages/types";
import { PeerMetadata, TrackMetadata } from "../pages/room/hooks/usePeerState";
import {
  LibraryPeersState,
  LibraryRemotePeer,
  LibraryTrack,
  LibraryTrackMinimal,
  PeerId,
  Selector,
  TrackId,
} from "../library/types";

export type PeerGui = { id: PeerId; emoji: string | null; name: string | null };
export type CreatePeersGuiSelector = () => Selector<PeerMetadata, TrackMetadata, Array<PeerGui>>;
export const createPeersGuiSelector: CreatePeersGuiSelector =
  (): Selector<PeerMetadata, TrackMetadata, Array<PeerGui>> =>
  (snapshot: LibraryPeersState<PeerMetadata, TrackMetadata> | null): Array<PeerGui> =>
    Object.values(snapshot?.remote || {}).map((peer) => ({
      id: peer.id,
      emoji: peer.metadata?.emoji || null,
      name: peer.metadata?.displayName || null,
    }));

export type CreatePeerGuiSelector = (peerId: PeerId) => Selector<PeerMetadata, TrackMetadata, PeerGui | null>;
export const createPeerGuiSelector: CreatePeerGuiSelector =
  (peerId: PeerId): Selector<PeerMetadata, TrackMetadata, PeerGui | null> =>
  (snapshot: LibraryPeersState<PeerMetadata, TrackMetadata> | null): PeerGui | null => {
    const peer = snapshot?.remote[peerId];
    if (!peer) return null;

    return {
      id: peer.id,
      emoji: peer.metadata?.emoji || null,
      name: peer.metadata?.displayName || null,
    };
  };

export type CreateLocalPeerGuiSelector = () => Selector<PeerMetadata, TrackMetadata, PeerGui | null>;
export const createLocalPeerGuiSelector: CreateLocalPeerGuiSelector =
  (): Selector<PeerMetadata, TrackMetadata, PeerGui | null> =>
  (snapshot: LibraryPeersState<PeerMetadata, TrackMetadata> | null): PeerGui | null => {
    if (!snapshot) return null;
    const peer = snapshot.local;
    if(!peer.id) throw Error("Local peerId is empty!")

    return {
      id: peer.id,
      emoji: peer.metadata?.emoji || null,
      name: peer.metadata?.displayName || null,
    };
  };

type CreateTracksRecordSelector = (
  peerId: PeerId
) => Selector<PeerMetadata, TrackMetadata, Partial<Record<TrackType, LibraryTrackMinimal>>>;
export const createTracksRecordSelector: CreateTracksRecordSelector =
  (peerId: PeerId): Selector<PeerMetadata, TrackMetadata, Partial<Record<TrackType, LibraryTrackMinimal>>> =>
  (
    snapshot: LibraryPeersState<PeerMetadata, TrackMetadata> | null
  ): Partial<Record<TrackType, LibraryTrackMinimal>> => {
    const tracks: Record<string, LibraryTrack<TrackMetadata>> = snapshot?.remote[peerId]?.tracks || {};
    const trackTuples: Array<[TrackType | null, LibraryTrackMinimal]> = Object.entries(tracks).map(
      ([trackId, track]) => {
        const trackType: TrackType | null = track.metadata?.type || null;
        if (!trackType) {
          console.warn(`Track '${trackId}' has empty type`);
        }
        const libraryMinimalTrack: LibraryTrackMinimal = {
          stream: track.stream,
          trackId: track.trackId,
          simulcastConfig: track.simulcastConfig ? { ...track.simulcastConfig } : null,
          track: track.track,
        };
        return [trackType, libraryMinimalTrack];
      }
    );
    const result: Partial<Record<TrackType, LibraryTrackMinimal>> = Object.fromEntries(trackTuples);

    // todo refactor delete to filter
    delete result["screensharing"];

    return result;
  };

type CreateScreenSharingTracksSelector = (
  peerId: PeerId
) => Selector<PeerMetadata, TrackMetadata, LibraryTrackMinimal | null>;
export const createScreenSharingTracksSelector: CreateScreenSharingTracksSelector =
  (peerId: PeerId): Selector<PeerMetadata, TrackMetadata, LibraryTrackMinimal | null> =>
  (snapshot: LibraryPeersState<PeerMetadata, TrackMetadata> | null): LibraryTrackMinimal | null => {
    if (!snapshot) return null;
    const tracks1: Record<TrackId, LibraryTrack<TrackMetadata>> = snapshot.local.id === peerId
      ? snapshot.local.tracks
      : snapshot.remote[peerId]?.tracks || {};

    console.log(`%c ${peerId}`, "color: orange");

    // const tracks1: Record<TrackId, LibraryTrack<TrackMetadata>> = snapshot.local.tracks

    const tracks: Record<string, LibraryTrack<TrackMetadata>> = tracks1;
    const trackTuples: Array<[TrackType | null, LibraryTrackMinimal]> = Object.entries(tracks).map(
      ([trackId, track]) => {
        const trackType: TrackType | null = track.metadata?.type || null;
        if (!trackType) {
          console.warn(`Track '${trackId}' has empty type`);
        }
        const libraryMinimalTrack: LibraryTrackMinimal = {
          stream: track.stream,
          trackId: track.trackId,
          simulcastConfig: track.simulcastConfig ? { ...track.simulcastConfig } : null,
          track: track.track,
        };
        return [trackType, libraryMinimalTrack];
      }
    );
    const result: Partial<Record<TrackType, LibraryTrackMinimal>> = Object.fromEntries(trackTuples);

    // todo refactor delete to filter
    return result["screensharing"] || null;
  };

type CreateLocalTracksRecordSelector = () => Selector<
  PeerMetadata,
  TrackMetadata,
  Partial<Record<TrackType, LibraryTrackMinimal>>
>;
export const createLocalTracksRecordSelector: CreateLocalTracksRecordSelector =
  (): Selector<PeerMetadata, TrackMetadata, Partial<Record<TrackType, LibraryTrackMinimal>>> =>
  (
    snapshot: LibraryPeersState<PeerMetadata, TrackMetadata> | null
  ): Partial<Record<TrackType, LibraryTrackMinimal>> => {
    const tracks: Record<string, LibraryTrack<TrackMetadata>> = snapshot?.local?.tracks || {};
    const trackTuples: Array<[TrackType | null, LibraryTrackMinimal]> = Object.entries(tracks).map(
      ([trackId, track]) => {
        const trackType: TrackType | null = track.metadata?.type || null;
        if (!trackType) {
          console.warn(`Track '${trackId}' has empty type`);
        }
        const libraryMinimalTrack: LibraryTrackMinimal = {
          stream: track.stream,
          trackId: track.trackId,
          simulcastConfig: track.simulcastConfig ? { ...track.simulcastConfig } : null,
          track: track.track,
        };
        return [trackType, libraryMinimalTrack];
      }
    );
    const result: Partial<Record<TrackType, LibraryTrackMinimal>> = Object.fromEntries(trackTuples);

    // todo refactor delete to filter
    delete result["screensharing"];

    return result;
  };

export type TrackStatus = "active" | "muted" | null;
type CreateAudioTrackStatusSelector = (peerId: PeerId) => Selector<PeerMetadata, TrackMetadata, TrackStatus>;
export const createAudioTrackStatusSelector: CreateAudioTrackStatusSelector =
  (peerId: PeerId): Selector<PeerMetadata, TrackMetadata, TrackStatus> =>
  (snapshot: LibraryPeersState<PeerMetadata, TrackMetadata> | null): TrackStatus => {
    if (!snapshot) return null;
    const peer = snapshot.remote[peerId];
    if (!peer) return null;

    const track = Object.values(peer.tracks).find((track) => track?.metadata?.type === "audio");
    if (!track) return null;

    if (track.metadata?.active === undefined) return null;
    return track.metadata.active ? "active" : "muted";
  };

type createIsScreenSharingActiveSelector = () => Selector<PeerMetadata, TrackMetadata, boolean>;
export const createIsScreenSharingActiveSelector: createIsScreenSharingActiveSelector =
  (): Selector<PeerMetadata, TrackMetadata, boolean> =>
  (snapshot: LibraryPeersState<PeerMetadata, TrackMetadata> | null): boolean => {
    if (!snapshot) return false;
    const localTracks: LibraryTrack<TrackMetadata>[] = Object.values(snapshot.local.tracks);

    const peers: LibraryRemotePeer<PeerMetadata, TrackMetadata>[] = Object.values(snapshot.remote);
    const tracks: LibraryTrack<TrackMetadata>[] = peers.flatMap((peer) => Object.values(peer.tracks));
    const result: boolean = [...localTracks, ...tracks].some((track) => track.metadata?.type === "screensharing");
    return result;
  };

const extractScreenSharingTrack = (
  tracks: Record<TrackId, LibraryTrack<TrackMetadata>>
): LibraryTrack<TrackMetadata> | null => {
  return Object.values(tracks).find((track) => track.metadata?.type === "screensharing") || null;
};

type CreateUsersIdsWithScreenSharingSelector = () => Selector<PeerMetadata, TrackMetadata, PeerId[]>;
export const createUsersIdsWithScreenSharingSelector: CreateUsersIdsWithScreenSharingSelector =
  (): Selector<PeerMetadata, TrackMetadata, PeerId[]> =>
  (snapshot: LibraryPeersState<PeerMetadata, TrackMetadata> | null): PeerId[] => {
    if (!snapshot) return [];
    const localUserScreenSharingTrack: LibraryTrack<TrackMetadata> | null = extractScreenSharingTrack(
      snapshot.local.tracks
    );

    const peers: LibraryRemotePeer<PeerMetadata, TrackMetadata>[] = Object.values(snapshot.remote).filter(
      (peer) => extractScreenSharingTrack(peer.tracks) !== null
    );

    const peersIds = peers.map((peer) => peer.id);
    const localId = localUserScreenSharingTrack?.trackId && snapshot.local?.id ? [snapshot.local.id] : [];

    return [...localId, ...peersIds];
  };
