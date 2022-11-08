import { useCallback, useMemo, useState } from "react";
import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";
import { TrackType } from "../../types";

export type Track = {
  trackId: string;
  mediaStreamTrack?: MediaStreamTrack;
  mediaStream?: MediaStream;
  metadata?: TrackMetadata;
  encoding?: TrackEncoding;
};

export type RemotePeer = {
  tracks: Track[];
} & NewPeer;

type PeersMap = {
  [peerId: string]: RemotePeer;
};

// todo move display name and emoji to metadata
export type NewPeer = {
  id: string;
  displayName?: string;
  emoji?: string;
  source: "local" | "remote";
};

export type TrackMetadata = {
  type?: TrackType;
};

export type PeersState = {
  local?: LocalPeer;
  remote: RemotePeer[];
};

export type TTrack = {
  stream?: MediaStream;
  trackId?: string;
  enabled: boolean;
  metadata?: any;
};

export type Tracks = {
  // [Property in TrackType]: TTrack;
  camera?: TTrack;
  screensharing?: TTrack;
  audio?: TTrack;
};

export type LocalPeer = {
  id?: string;
  metadata?: PeerMetadata;
  tracks: Tracks;
};

export type PeersApi = {
  addPeers: (peerId: NewPeer[]) => void;
  removePeer: (peerId: string) => void;
  addTrack: (
    peerId: string,
    trackId: string,
    mediaStreamTrack?: MediaStreamTrack,
    mediaStream?: MediaStream,
    metadata?: TrackMetadata
  ) => void;
  removeTrack: (peerId: string, trackId: string) => void;
  setMetadata: (peerId: string, trackId: string, metadata: any) => void;
  setEncoding: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  setLocalPeer: (id: string, metadata?: PeerMetadata) => void;
  setLocalStream: (type: TrackType, enabled: boolean, stream: MediaStream | undefined) => void;
  setLocalTrackId: (type: TrackType, trackId?: string) => void;
  setLocalTrackMetadata: (type: TrackType, metadata?: any) => void;
};

type UsePeersStateResult = {
  state: PeersState;
  api: PeersApi;
};

export type PeerMetadata = {
  emoji?: string;
  displayName?: string;
};

const copyTrack = (peer: RemotePeer, trackId: string) => peer.tracks.find((track) => track.trackId === trackId);

const copyOtherTracks = (peer: RemotePeer, trackId: string) => peer.tracks.filter((track) => track.trackId !== trackId);

export const usePeersState = (): UsePeersStateResult => {
  const [remotePeers, setRemotePeers] = useState<PeersMap>({});
  // todo maybe remove '| undefined'
  const [localPeerState, setLocalPeerState] = useState<LocalPeer | undefined>();

  const setLocalPeer = useCallback((id: string, metadata?: PeerMetadata) => {
    console.log({ name: "setLocalPeer" });
    setLocalPeerState((prevState: LocalPeer | undefined) => {
      const stateCopy = prevState ?? { tracks: {} };
      return { ...stateCopy, id: id, metadata: metadata };
    });
  }, []);

  const setLocalStream = useCallback((type: TrackType, enabled: boolean, stream?: MediaStream) => {
    console.log({ name: "setLocalStream" });

    // console.log("1");
    setLocalPeerState((prevState: LocalPeer | undefined) => {
      const state: LocalPeer = prevState ? { ...prevState } : { tracks: {} };
      const newTrack = { ...state.tracks[type], enabled, stream };

      return { ...state, tracks: { ...state.tracks, [type]: newTrack } };
    });
  }, []);

  const setLocalTrackMetadata = useCallback((type: TrackType, metadata: any) => {
    console.log({ name: "setLocalTrackMetadata" });

    // console.log("1");
    setLocalPeerState((prevState: LocalPeer | undefined) => {
      const state: LocalPeer = prevState ? { ...prevState } : { tracks: {} };
      const newTrack = { ...state.tracks[type], metadata };

      return { ...state, tracks: { ...state.tracks, [type]: newTrack } };
    });
  }, []);

  // TODO
  const setLocalTrackId = useCallback((type: TrackType, trackId?: string) => {
    console.log({ name: "setLocalTrackId" });

    // console.log("2");
    setLocalPeerState((prevState: LocalPeer | undefined) => {
      const state: LocalPeer = prevState ? { ...prevState } : { tracks: {} };
      const newTrack = { ...state.tracks[type], trackId };

      return { ...state, tracks: { ...state.tracks, [type]: newTrack } };
    });
  }, []);

  const addPeers = useCallback((peerIds: NewPeer[]) => {
    console.log({ name: "addPeers" });

    setRemotePeers((prevState: PeersMap) => {
      const newPeers: PeersMap = Object.fromEntries(
        peerIds.map((peer) => [
          peer.id,
          {
            id: peer.id,
            tracks: [],
            displayName: peer.displayName,
            emoji: peer.emoji,
            source: peer.source,
          },
        ])
      );
      return { ...prevState, ...newPeers };
    });
  }, []);

  const removePeer = useCallback((peerId: string) => {
    console.log({ name: "removePeer" });

    setRemotePeers((prev) => {
      const newState = { ...prev };
      delete newState[peerId];
      return newState;
    });
  }, []);

  const addTrack = useCallback(
    (
      peerId: string,
      trackId: string,
      mediaStreamTrack?: MediaStreamTrack,
      mediaStream?: MediaStream,
      metadata?: TrackMetadata
    ) => {
      console.log({ name: "addTrack" });

      setRemotePeers((prev: PeersMap) => {
        const peerCopy: RemotePeer = { ...prev[peerId] };
        const oldTracks: Track[] = copyOtherTracks(peerCopy, trackId);

        const newTrack = {
          mediaStreamTrack: mediaStreamTrack,
          mediaStream: mediaStream,
          metadata: metadata,
          trackId: trackId,
        };

        const newTracks: Track[] = [...oldTracks, newTrack];
        return { ...prev, [peerId]: { ...peerCopy, tracks: newTracks } };
      });
    },
    []
  );

  const setEncoding = useCallback((peerId: string, trackId: string, encoding: TrackEncoding) => {
    console.log({ name: "setEncoding" });

    setRemotePeers((prev: PeersMap) => {
      const peerCopy: RemotePeer = { ...prev[peerId] };
      const trackCopy: Track | undefined = copyTrack(peerCopy, trackId);
      if (!trackCopy) return prev;

      trackCopy.encoding = encoding;

      const otherTracks: Track[] = copyOtherTracks(peerCopy, trackId);

      return { ...prev, [peerId]: { ...peerCopy, tracks: [...otherTracks, trackCopy] } };
    });
  }, []);

  const setMetadata = useCallback((peerId: string, trackId: string, metadata: any) => {
    console.log({ name: "setMetadata" });

    setRemotePeers((prev: PeersMap) => {
      const peerCopy: RemotePeer = { ...prev[peerId] };
      const trackCopy: Track | undefined = copyTrack(peerCopy, trackId);
      if (!trackCopy) return prev;

      trackCopy.metadata = metadata;

      const otherTracks: Track[] = copyOtherTracks(peerCopy, trackId);

      return { ...prev, [peerId]: { ...peerCopy, tracks: [...otherTracks, trackCopy] } };
    });
  }, []);

  const removeTrack = useCallback((peerId: string, trackId: string) => {
    console.log({ name: "removeTrack" });

    setRemotePeers((prev) => {
      const newState: PeersMap = { ...prev };
      const peerCopy: RemotePeer = { ...prev[peerId] };
      const newPeer: RemotePeer = {
        ...peerCopy,
        tracks: copyOtherTracks(peerCopy, trackId),
      };
      delete newState[peerId];
      return { ...newState, [peerId]: newPeer };
    });
  }, []);

  const api: PeersApi = useMemo(
    () => ({
      addPeers,
      removePeer,
      addTrack,
      removeTrack,
      setEncoding,
      setLocalPeer,
      setLocalStream,
      setLocalTrackId,
      setMetadata,
      setLocalTrackMetadata,
    }),
    [
      addPeers,
      removePeer,
      addTrack,
      removeTrack,
      setEncoding,
      setLocalPeer,
      setLocalStream,
      setLocalTrackId,
      setMetadata,
      setLocalTrackMetadata,
    ]
  );

  const state: PeersState = useMemo(() => {
    const remoteUsersArray: RemotePeer[] = Object.values(remotePeers);

    return {
      local: localPeerState,
      remote: remoteUsersArray,
    };
  }, [localPeerState, remotePeers]);

  return { state, api };
};
