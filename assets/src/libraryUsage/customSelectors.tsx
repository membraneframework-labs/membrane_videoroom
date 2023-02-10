import type { TrackType } from "../pages/types";
import type { Peer, PeerId, Selector, SimulcastConfig, State, Track, TrackId } from "membrane-react-webrtc-client";
import type { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import type { PeerMetadata, TrackMetadata } from "./types";

export type LibraryTrackMinimal = {
  stream: MediaStream | null;
  trackId: TrackId;
  track: MediaStreamTrack | null;
  simulcastConfig: SimulcastConfig | null;
};

const extractTrackByType = (
  tracks: Record<TrackId, Track<TrackMetadata>>,
  trackType: string
): Track<TrackMetadata> | null => {
  return Object.values(tracks).find((track) => track.metadata?.type === trackType) || null;
};

const getAllTracksSelector = (snapshot: State<PeerMetadata, TrackMetadata>): Track<TrackMetadata>[] => {
  const localTracks: Track<TrackMetadata>[] = snapshot.local ? Object.values(snapshot.local.tracks) : [];
  const peers: Peer<PeerMetadata, TrackMetadata>[] = Object.values(snapshot.remote);
  const tracks: Track<TrackMetadata>[] = peers.flatMap((peer) => Object.values(peer.tracks));
  return [...localTracks, ...tracks];
};

const getAllTracksSelectorAsRecord = (
  snapshot: State<PeerMetadata, TrackMetadata>
): Record<TrackId, Track<TrackMetadata>> => {
  return Object.values(getAllPeersSelector(snapshot))
    .flatMap((peer) => Object.values(peer.tracks))
    .reduce((acc, currentValue) => {
      acc[currentValue.trackId] = currentValue;
      return acc;
    }, {} as Record<TrackId, Track<TrackMetadata>>);
};

const getAllPeersSelector = (
  snapshot: State<PeerMetadata, TrackMetadata>
): Record<PeerId, Peer<PeerMetadata, TrackMetadata>> => {
  return snapshot.local ? { [snapshot.local.id]: snapshot.local, ...snapshot.remote } : snapshot.remote;
};

export type PeerGui = { id: PeerId; emoji: string | null; name: string | null };

export type CreatePeerGuiSelector = (peerId: PeerId) => Selector<PeerMetadata, TrackMetadata, PeerGui | null>;
export const createPeerGuiSelector: CreatePeerGuiSelector =
  (peerId: PeerId): Selector<PeerMetadata, TrackMetadata, PeerGui | null> =>
  (snapshot: State<PeerMetadata, TrackMetadata>): PeerGui | null => {
    const peer = snapshot.remote[peerId];
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
  (snapshot: State<PeerMetadata, TrackMetadata> | null): PeerGui | null => {
    if (!snapshot) return null;
    const peer = snapshot.local;
    if (!peer) throw Error("Local peerId is empty!");

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
  (snapshot: State<PeerMetadata, TrackMetadata>): Partial<Record<TrackType, LibraryTrackMinimal>> => {
    const tracks: Record<string, Track<TrackMetadata>> = snapshot?.remote[peerId]?.tracks || {};
    const trackTuples: Array<[TrackType | null, LibraryTrackMinimal]> = Object.entries(tracks).map(
      ([trackId, track]) => {
        const trackType: TrackType | null = track.metadata?.type || null;
        if (!trackType) {
          console.warn(`1 Track '${trackId}' has empty type`);
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

type CreateTrackEncodingSelector = (
  trackId: TrackId | null
) => Selector<PeerMetadata, TrackMetadata, TrackEncoding | null>;

export const createTrackEncodingSelector: CreateTrackEncodingSelector = (
  trackId: TrackId | null
): Selector<PeerMetadata, TrackMetadata, TrackEncoding | null> => {
  return (snapshot: State<PeerMetadata, TrackMetadata>): TrackEncoding | null => {
    return getAllTracksSelector(snapshot).find((track) => track.trackId === trackId)?.encoding || null;
  };
};

// todo refactor
export const createScreenSharingTracksSelector =
  (peerId: PeerId): Selector<PeerMetadata, TrackMetadata, LibraryTrackMinimal | null> =>
  (snapshot: State<PeerMetadata, TrackMetadata> | null): LibraryTrackMinimal | null => {
    if (!snapshot) return null;
    if (!snapshot.local) return null;

    const tracks: Record<TrackId, Track<TrackMetadata>> = getAllPeersSelector(snapshot)[peerId].tracks;

    const trackTuples: Array<[TrackType | null, LibraryTrackMinimal]> = Object.entries(tracks).map(
      ([trackId, track]) => {
        const trackType: TrackType | null = track.metadata?.type || null;
        if (!trackType) {
          console.warn(`2 Track '${trackId}' has empty type`);
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

export const createLocalTracksRecordSelector = () => {
  return (snapshot: State<PeerMetadata, TrackMetadata>): Partial<Record<TrackType, LibraryTrackMinimal>> => {
    const tracks: Record<string, Track<TrackMetadata>> = snapshot.local?.tracks || {};
    const trackTuples: Array<[TrackType | null, LibraryTrackMinimal]> = Object.entries(tracks).map(
      ([trackId, track]) => {
        const trackType: TrackType | null = track.metadata?.type || null;
        if (!trackType) {
          console.log({ track });
          console.warn(`3 Track '${trackId}' has empty type`);
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
};

export const createIsScreenSharingActiveSelector = (): Selector<PeerMetadata, TrackMetadata, boolean> => {
  return (snapshot: State<PeerMetadata, TrackMetadata>): boolean => {
    return getAllTracksSelector(snapshot).some((track) => track.metadata?.type === "screensharing");
  };
};

type CreateUsersIdsWithScreenSharingSelector = () => Selector<PeerMetadata, TrackMetadata, PeerId[]>;
export const createUsersIdsWithScreenSharingSelector: CreateUsersIdsWithScreenSharingSelector =
  (): Selector<PeerMetadata, TrackMetadata, PeerId[]> =>
  (snapshot: State<PeerMetadata, TrackMetadata>): PeerId[] => {
    if (!snapshot) return [];
    if (!snapshot.local) return [];

    const localUserScreenSharingTrack: Track<TrackMetadata> | null = extractTrackByType(
      snapshot.local.tracks,
      "screensharing"
    );

    const peers: Peer<PeerMetadata, TrackMetadata>[] = Object.values(snapshot.remote).filter(
      (peer) => extractTrackByType(peer.tracks, "screensharing") !== null
    );

    const peersIds = peers.map((peer) => peer.id);
    const localId = localUserScreenSharingTrack?.trackId && snapshot.local?.id ? [snapshot.local.id] : [];

    return [...localId, ...peersIds];
  };

export const createIsActiveTrackSelector = (
  trackId: TrackId | null
): Selector<PeerMetadata, TrackMetadata, boolean> => {
  return (snapshot: State<PeerMetadata, TrackMetadata>): boolean => {
    if (!trackId) return false;
    return getAllTracksSelectorAsRecord(snapshot)[trackId]?.metadata?.active || false;
  };
};
