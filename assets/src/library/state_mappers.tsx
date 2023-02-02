import { Peer, SimulcastConfig, TrackContext } from "@jellyfish-dev/membrane-webrtc-js";
import { LibraryLocalPeer, LibraryPeersState, LibraryRemotePeer, LibraryTrack, TrackId } from "./state.types";

export const onPeerJoined =
  <PeerMetadataGeneric, TrackMetadataGeneric>(peer: Peer) =>
  (prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>) => {
    const remote: Record<string, LibraryRemotePeer<PeerMetadataGeneric, TrackMetadataGeneric>> = {
      ...prevState.remote,
      [peer.id]: { id: peer.id, metadata: peer.metadata, tracks: {} },
    };

    return { ...prevState, remote };
  };
export const onPeerLeft =
  <PeerMetadataGeneric, TrackMetadataGeneric>(peer: Peer) =>
  (prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>) => {
    const remote: Record<string, LibraryRemotePeer<PeerMetadataGeneric, TrackMetadataGeneric>> = {
      ...prevState.remote,
    };

    delete remote[peer.id];

    return { ...prevState, remote };
  };
export const onTrackReady =
  <PeerMetadataGeneric, TrackMetadataGeneric>(ctx: TrackContext) =>
  (prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>) => {
    if (!ctx.stream) return prevState;
    if (!ctx.peer) return prevState;
    if (!ctx.trackId) return prevState;

    const remote: Record<string, LibraryRemotePeer<PeerMetadataGeneric, TrackMetadataGeneric>> = {
      ...prevState.remote,
    };

    // todo fix this mutation
    remote[ctx.peer.id].tracks[ctx.trackId] = {
      trackId: ctx.trackId,
      metadata: ctx.metadata,
      stream: ctx.stream,
      track: ctx.track,
      encoding: ctx.encoding || null,
      simulcastConfig: ctx.simulcastConfig
        ? {
            enabled: ctx.simulcastConfig.enabled,
            activeEncodings: [...ctx.simulcastConfig.active_encodings],
          }
        : null,
    };

    return { ...prevState, remote: remote };
  };
export const onTrackAdded =
  <PeerMetadataGeneric, TrackMetadataGeneric>(ctx: TrackContext) =>
  (prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>) => {
    if (!ctx.peer) return prevState;
    if (!ctx.trackId) return prevState;

    const remote: Record<string, LibraryRemotePeer<PeerMetadataGeneric, TrackMetadataGeneric>> = {
      ...prevState.remote,
    };

    // todo fix this mutation
    remote[ctx.peer.id].tracks[ctx.trackId] = {
      trackId: ctx.trackId,
      metadata: ctx.metadata,
      encoding: ctx.encoding || null,
      simulcastConfig: ctx.simulcastConfig
        ? {
            enabled: ctx.simulcastConfig.enabled,
            activeEncodings: [...ctx.simulcastConfig.active_encodings],
          }
        : null,
      stream: ctx.stream,
      track: ctx.track,
    };

    return { ...prevState, remote: remote };
  };

export const onTrackRemoved =
  <PeerMetadataGeneric, TrackMetadataGeneric>(ctx: TrackContext) =>
  (prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>) => {
    if (!ctx.peer) return prevState;
    if (!ctx.trackId) return prevState;

    const remote: Record<string, LibraryRemotePeer<PeerMetadataGeneric, TrackMetadataGeneric>> = {
      ...prevState.remote,
    };

    delete remote[ctx.peer.id].tracks[ctx.trackId];

    return { ...prevState, remote: remote };
  };

export const onTrackEncodingChanged =
  <PeerMetadataGeneric, TrackMetadataGeneric>(peerId: string, trackId: string, encoding: "l" | "m" | "h") =>
  (prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>) => {
    const remote: Record<string, LibraryRemotePeer<PeerMetadataGeneric, TrackMetadataGeneric>> = {
      ...prevState.remote,
    };

    const peer = remote[peerId];

    const track = { ...peer.tracks[trackId], encoding };

    return {
      ...prevState,
      remote: {
        ...prevState.remote,
        [peerId]: { ...peer, tracks: { ...peer.tracks, [trackId]: track } },
      },
    };
  };
export const onTrackUpdated =
  <PeerMetadataGeneric, TrackMetadataGeneric>(ctx: TrackContext) =>
  (prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>) => {
    const remote: Record<string, LibraryRemotePeer<PeerMetadataGeneric, TrackMetadataGeneric>> = {
      ...prevState.remote,
    };

    const peer = remote[ctx.peer.id];

    const track: LibraryTrack<TrackMetadataGeneric> = {
      ...peer.tracks[ctx.trackId],
      stream: ctx.stream,
      metadata: ctx.metadata,
    };

    return {
      ...prevState,
      remote: {
        ...prevState.remote,
        [ctx.peer.id]: { ...peer, tracks: { ...peer.tracks, [ctx.trackId]: track } },
      },
    };
  };

export const onJoinSuccess =
  <PeerMetadataGeneric, TrackMetadataGeneric>(peersInRoom: [Peer], peerId: string, peerMetadata: PeerMetadataGeneric) =>
  (
    prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>
  ): LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric> => {
    const remote: Record<string, LibraryRemotePeer<PeerMetadataGeneric, TrackMetadataGeneric>> = Object.fromEntries(
      new Map(
        peersInRoom.map((peer) => [
          peer.id,
          {
            id: peer.id,
            metadata: peer.metadata,
            tracks: {},
          },
        ])
      )
    );

    // todo add your own metadata
    const local: LibraryLocalPeer<PeerMetadataGeneric, TrackMetadataGeneric> = {
      id: peerId,
      metadata: peerMetadata,
      tracks: {},
    };

    return { ...prevState, local, remote };
  };
export const addTrack =
  <PeerMetadataGeneric, TrackMetadataGeneric>(
    remoteTrackId: string,
    track: MediaStreamTrack,
    stream: MediaStream,
    trackMetadata: TrackMetadataGeneric | undefined,
    simulcastConfig: SimulcastConfig | undefined
  ) =>
  (
    prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>
  ): LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric> => {
    return {
      ...prevState,
      local: {
        ...prevState.local,
        tracks: {
          ...prevState.local.tracks,
          [remoteTrackId]: {
            track: track,
            trackId: remoteTrackId,
            stream: stream,
            encoding: null,
            metadata: trackMetadata || null,
            simulcastConfig: simulcastConfig
              ? {
                  enabled: simulcastConfig?.enabled,
                  activeEncodings: [...simulcastConfig.active_encodings],
                }
              : null,
          },
        },
      },
    };
  };
export const replaceTrack =
  <PeerMetadataGeneric, TrackMetadataGeneric>(
    trackId: string,
    newTrack: MediaStreamTrack,
    newTrackMetadata: TrackMetadataGeneric | undefined
  ) =>
  (
    prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>
  ): LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric> => {
    const prevTrack: LibraryTrack<TrackMetadataGeneric> | null = prevState?.local?.tracks[trackId] || null;
    if (!prevTrack) return prevState;

    return {
      ...prevState,
      local: {
        ...prevState.local,
        tracks: {
          ...prevState.local.tracks,
          [trackId]: {
            ...prevTrack,
            track: newTrack,
            trackId: trackId,
            metadata: newTrackMetadata ? { ...newTrackMetadata } : null,
          },
        },
      },
    };
  };
export const removeTrack =
  <PeerMetadataGeneric, TrackMetadataGeneric>(trackId: string) =>
  (
    prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>
  ): LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric> => {
    const tracksCopy: Record<TrackId, LibraryTrack<TrackMetadataGeneric>> | undefined = prevState?.local?.tracks;
    delete tracksCopy[trackId];

    return {
      ...prevState,
      local: {
        ...prevState.local,
        tracks: tracksCopy,
      },
    };
  };
export const updateTrackMetadata =
  <PeerMetadataGeneric, TrackMetadataGeneric>(trackId: string, trackMetadata: TrackMetadataGeneric) =>
  (
    prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>
  ): LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric> => {
    const prevTrack: LibraryTrack<TrackMetadataGeneric> | null = prevState?.local?.tracks[trackId] || null;
    if (!prevTrack) return prevState;

    return {
      ...prevState,
      local: {
        ...prevState.local,
        tracks: {
          ...prevState.local.tracks,
          [trackId]: {
            ...prevTrack,
            metadata: trackMetadata ? { ...trackMetadata } : null,
          },
        },
      },
    };
  };