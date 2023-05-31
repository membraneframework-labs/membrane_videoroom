import type { Peer as WebRtcPeer, SimulcastConfig, TrackContext } from "@jellyfish-dev/membrane-webrtc-js";
import type { Peer, PeerId, State, Track, TrackId } from "./state.types";

export const onSocketOpen =
  <PeerMetadata, TrackMetadata>() =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    return { ...prevState, status: "connected" };
  };

export const onSocketError =
  <PeerMetadata, TrackMetadata>() =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    return { ...prevState, status: "error" };
  };
export const onAuthSuccess =
  <PeerMetadata, TrackMetadata>() =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    return { ...prevState, status: "authenticated" };
  };

export const onAuthError =
  <PeerMetadata, TrackMetadata>() =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    return { ...prevState, status: "error" };
  };

export const onDisconnected =
  <PeerMetadata, TrackMetadata>() =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    return { ...prevState, status: null };
  };

export const onPeerJoined =
  <PeerMetadata, TrackMetadata>(peer: WebRtcPeer) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    const remote: Record<PeerId, Peer<PeerMetadata, TrackMetadata>> = {
      ...prevState.remote,
      [peer.id]: { id: peer.id, metadata: peer.metadata, tracks: {} },
    };

    return { ...prevState, remote };
  };

export const onPeerUpdated =
  <PeerMetadata, TrackMetadata>(peer: WebRtcPeer) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    return {
      ...prevState,
      remote: {
        ...prevState.remote,
        [peer.id]: {
          ...prevState.remote[peer.id],
          id: peer.id,
          metadata: peer.metadata,
        },
      },
    };
  };

export const onPeerLeft =
  <PeerMetadata, TrackMetadata>(peer: WebRtcPeer) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    const remote: Record<PeerId, Peer<PeerMetadata, TrackMetadata>> = {
      ...prevState.remote,
    };

    delete remote[peer.id];

    return { ...prevState, remote };
  };

export const onPeerRemoved =
  <PeerMetadata, TrackMetadata>(_reason: string) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    return { ...prevState, local: null };
  };

const createTrack = <TrackMetadata,>(ctx: TrackContext): Track<TrackMetadata> => ({
  trackId: ctx.trackId,
  metadata: ctx.metadata,
  stream: ctx.stream,
  vadStatus: ctx.vadStatus,
  track: ctx.track,
  encoding: ctx.encoding || null,
  simulcastConfig: ctx.simulcastConfig
    ? {
        enabled: ctx.simulcastConfig.enabled,
        activeEncodings: [...ctx.simulcastConfig.active_encodings],
      }
    : null,
});

export const onTrackReady =
  <PeerMetadata, TrackMetadata>(ctx: TrackContext) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    if (!ctx.stream) return prevState;
    if (!ctx.peer) return prevState;
    if (!ctx.trackId) return prevState;

    const peer = prevState.remote[ctx.peer.id];

    return {
      ...prevState,
      remote: {
        ...prevState.remote,
        [ctx.peer.id]: {
          ...peer,
          tracks: {
            ...peer.tracks,
            [ctx.trackId]: createTrack(ctx),
          },
        },
      },
    };
  };

export const onTrackAdded =
  <PeerMetadata, TrackMetadata>(ctx: TrackContext) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    if (!ctx.peer) return prevState;
    if (!ctx.trackId) return prevState;

    const peer = prevState.remote[ctx.peer.id];

    return {
      ...prevState,
      remote: {
        ...prevState.remote,
        [ctx.peer.id]: {
          ...peer,
          tracks: {
            ...peer.tracks,
            [ctx.trackId]: createTrack(ctx),
          },
        },
      },
    };
  };

export const onTrackRemoved =
  <PeerMetadata, TrackMetadata>(ctx: TrackContext) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    if (!ctx.peer) return prevState;
    if (!ctx.trackId) return prevState;

    const remote: Record<PeerId, Peer<PeerMetadata, TrackMetadata>> = {
      ...prevState.remote,
    };

    delete remote[ctx.peer.id].tracks[ctx.trackId];

    return { ...prevState, remote: remote };
  };

export const onTrackEncodingChanged =
  <PeerMetadata, TrackMetadata>(peerId: PeerId, trackId: TrackId, encoding: "l" | "m" | "h") =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    const remote: Record<PeerId, Peer<PeerMetadata, TrackMetadata>> = {
      ...prevState.remote,
    };

    const peer = remote[peerId];
    const track = { ...peer.tracks[trackId], encoding };

    return {
      ...prevState,
      remote: {
        ...prevState.remote,
        [peerId]: {
          ...peer,
          tracks: {
            ...peer.tracks,
            [trackId]: track,
          },
        },
      },
    };
  };

export const onTrackUpdated =
  <PeerMetadata, TrackMetadata>(ctx: TrackContext) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    const remote: Record<PeerId, Peer<PeerMetadata, TrackMetadata>> = {
      ...prevState.remote,
    };

    const peer = remote[ctx.peer.id];

    const track: Track<TrackMetadata> = {
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

// todo handle state
export const onTracksPriorityChanged =
  <PeerMetadata, TrackMetadata>(_enabledTracks: TrackContext[], _disabledTracks: TrackContext[]) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    return prevState;
  };

export const onJoinSuccess =
  <PeerMetadata, TrackMetadata>(peersInRoom: [WebRtcPeer], peerId: PeerId, peerMetadata: PeerMetadata) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    const peersMap = new Map(
      peersInRoom.map((peer) => [
        peer.id,
        {
          id: peer.id,
          metadata: peer.metadata,
          tracks: {},
        },
      ])
    );

    const remote: Record<PeerId, Peer<PeerMetadata, TrackMetadata>> = Object.fromEntries(peersMap);

    const local: Peer<PeerMetadata, TrackMetadata> = {
      id: peerId,
      metadata: peerMetadata,
      tracks: {},
    };

    return { ...prevState, local, remote, status: "joined" };
  };

// todo handle state and handle callback
export const onJoinError =
  <PeerMetadata, TrackMetadata>(_metadata: unknown) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    return { ...prevState, status: "error" };
  };

export const addTrack =
  <PeerMetadata, TrackMetadata>(
    remoteTrackId: TrackId,
    track: MediaStreamTrack,
    stream: MediaStream,
    trackMetadata: TrackMetadata | undefined,
    simulcastConfig: SimulcastConfig | undefined
  ) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    const prevLocalPeer = prevState.local;
    if (!prevLocalPeer) return prevState;

    return {
      ...prevState,
      local: {
        ...prevLocalPeer,
        tracks: {
          ...prevLocalPeer.tracks,
          [remoteTrackId]: {
            track: track,
            trackId: remoteTrackId,
            stream: stream,
            encoding: null,
            metadata: trackMetadata || null,
            vadStatus: "silence", // todo investigate vad status for localPeer
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
  <PeerMetadata, TrackMetadata>(
    trackId: TrackId,
    newTrack: MediaStreamTrack,
    stream: MediaStream,
    newTrackMetadata: TrackMetadata | undefined
  ) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    const prevTrack: Track<TrackMetadata> | null = prevState?.local?.tracks[trackId] || null;
    if (!prevTrack) return prevState;
    const prevLocalPeer = prevState.local;
    if (!prevLocalPeer) return prevState;

    return {
      ...prevState,
      local: {
        ...prevLocalPeer,
        tracks: {
          ...prevLocalPeer.tracks,
          [trackId]: {
            ...prevTrack,
            track: newTrack,
            stream: stream,
            trackId: trackId,
            metadata: newTrackMetadata ? { ...newTrackMetadata } : null,
          },
        },
      },
    };
  };

export const removeTrack =
  <PeerMetadata, TrackMetadata>(trackId: TrackId) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    const prevLocalPeer = prevState.local;
    if (!prevLocalPeer) return prevState;

    const tracksCopy: Record<TrackId, Track<TrackMetadata>> | undefined = prevLocalPeer.tracks;
    delete tracksCopy[trackId];

    return {
      ...prevState,
      local: {
        ...prevLocalPeer,
        tracks: tracksCopy,
      },
    };
  };

export const updateTrackMetadata =
  <PeerMetadata, TrackMetadata>(trackId: TrackId, trackMetadata: TrackMetadata) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    const prevLocalPeer = prevState.local;
    if (!prevLocalPeer) return prevState;

    const prevTrack: Track<TrackMetadata> | null = prevLocalPeer.tracks[trackId] || null;
    if (!prevTrack) return prevState;

    return {
      ...prevState,
      local: {
        ...prevLocalPeer,
        tracks: {
          ...prevLocalPeer.tracks,
          [trackId]: {
            ...prevTrack,
            metadata: trackMetadata ? { ...trackMetadata } : null,
          },
        },
      },
    };
  };

export const onBandwidthEstimationChanged =
  <PeerMetadata, TrackMetadata>(estimation: bigint) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    return {
      ...prevState,
      bandwidthEstimation: estimation,
    };
  };

export const onEncodingChanged =
  <PeerMetadata, TrackMetadata>(ctx: TrackContext) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    if (!ctx.encoding) return prevState;
    return onTrackEncodingChanged<PeerMetadata, TrackMetadata>(ctx.peer.id, ctx.trackId, ctx.encoding)(prevState);
  };

export const onVoiceActivityChanged =
  <PeerMetadata, TrackMetadata>(ctx: TrackContext) =>
  (prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
    const peer: Peer<PeerMetadata, TrackMetadata> = prevState.remote[ctx.peer.id];
    const tracks: Record<TrackId, Track<TrackMetadata>> = peer.tracks;
    const track: Track<TrackMetadata> = { ...tracks[ctx.trackId], vadStatus: ctx.vadStatus };

    return {
      ...prevState,
      remote: { ...prevState.remote, [ctx.peer.id]: { ...peer, tracks: { ...tracks, [ctx.trackId]: track } } },
    };
  };
