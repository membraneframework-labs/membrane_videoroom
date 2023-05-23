import { useCallback, useMemo, useState } from "react";
import { TrackEncoding, VadStatus } from "@jellyfish-dev/membrane-webrtc-js";
import { TrackType } from "../../types";

export type ApiTrack = {
  trackId: string;
  isSpeaking: boolean;
  mediaStreamTrack?: MediaStreamTrack;
  mediaStream?: MediaStream;
  encoding?: TrackEncoding;
  metadata?: TrackMetadata;
};

export type RemotePeer = {
  tracks: ApiTrack[];
} & NewPeer;

type PeersMap = {
  [peerId: string]: RemotePeer;
};

// todo move display name and emoji to metadata
export type NewPeer = {
  id: string;
  displayName?: string;
  source: "local" | "remote";
};

export type TrackMetadata = {
  type?: TrackType;
};

export type PeersState = {
  local?: LocalPeer;
  remote: RemotePeer[];
};

export type Track = {
  stream?: MediaStream;
  trackId: string | null;
  enabled: boolean;
  metadata?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type Tracks = {
  [Property in TrackType]?: Track;
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
    metadata?: TrackMetadata,
    mediaStreamTrack?: MediaStreamTrack,
    mediaStream?: MediaStream,
    vadStatus?: VadStatus
  ) => void;
  removeTrack: (peerId: string, trackId: string) => void;
  setMetadata: (peerId: string, trackId: string, metadata: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  setEncoding: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  setIsSpeaking: (peerId: string, trackId: string, vadStatus: VadStatus) => void;
  setLocalPeer: (id: string, metadata?: PeerMetadata) => void;
  setLocalStream: (type: TrackType, enabled: boolean, stream: MediaStream | null) => void;
  setLocalTrackId: (type: TrackType, trackId: string | null) => void;
  setLocalTrackMetadata: (type: TrackType, metadata?: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
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
    setLocalPeerState((prevState: LocalPeer | undefined) => {
      const stateCopy = prevState ?? { tracks: {} };
      return { ...stateCopy, id: id, metadata: metadata };
    });
  }, []);

  const setLocalStream = useCallback((type: TrackType, enabled: boolean, stream: MediaStream | null) => {
    setLocalPeerState((prevState: LocalPeer | undefined) => {
      const state: LocalPeer = prevState ? { ...prevState } : { tracks: {} };
      const newTrack = { ...state.tracks[type], enabled, stream };

      return { ...state, tracks: { ...state.tracks, [type]: newTrack } };
    });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setLocalTrackMetadata = useCallback((type: TrackType, metadata: any) => {
    setLocalPeerState((prevState: LocalPeer | undefined) => {
      const state: LocalPeer = prevState ? { ...prevState } : { tracks: {} };
      const newTrack = { ...state.tracks[type], metadata };

      return { ...state, tracks: { ...state.tracks, [type]: newTrack } };
    });
  }, []);

  const setLocalTrackId = useCallback((type: TrackType, trackId: string | null) => {
    setLocalPeerState((prevState: LocalPeer | undefined) => {
      const state: LocalPeer = prevState ? { ...prevState } : { tracks: {} };
      const newTrack = { ...state.tracks[type], trackId };

      return { ...state, tracks: { ...state.tracks, [type]: newTrack } };
    });
  }, []);

  const addPeers = useCallback((peerIds: NewPeer[]) => {
    setRemotePeers((prevState: PeersMap) => {
      const newPeers: PeersMap = Object.fromEntries(
        peerIds.map((peer) => [
          peer.id,
          {
            id: peer.id,
            tracks: [],
            displayName: peer.displayName,
            source: peer.source,
          },
        ])
      );
      return { ...prevState, ...newPeers };
    });
  }, []);

  const removePeer = useCallback((peerId: string) => {
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
      metadata?: TrackMetadata,
      mediaStreamTrack?: MediaStreamTrack,
      mediaStream?: MediaStream,
      vadStatus?: VadStatus
    ) => {
      setRemotePeers((prev: PeersMap) => {
        const peerCopy: RemotePeer = { ...prev[peerId] };
        const oldTracks: ApiTrack[] = copyOtherTracks(peerCopy, trackId);

        const newTrack = {
          trackId: trackId,
          mediaStreamTrack: mediaStreamTrack,
          mediaStream: mediaStream,
          isSpeaking: vadStatus === "speech",
          metadata: metadata,
        };

        const newTracks: ApiTrack[] = [...oldTracks, newTrack];
        return { ...prev, [peerId]: { ...peerCopy, tracks: newTracks } };
      });
    },
    []
  );

  const setEncoding = useCallback((peerId: string, trackId: string, encoding: TrackEncoding) => {
    setRemotePeers((prev: PeersMap) => {
      const peerCopy: RemotePeer = { ...prev[peerId] };
      const trackCopy: ApiTrack | undefined = copyTrack(peerCopy, trackId);
      if (!trackCopy) return prev;

      trackCopy.encoding = encoding;

      const otherTracks: ApiTrack[] = copyOtherTracks(peerCopy, trackId);

      return { ...prev, [peerId]: { ...peerCopy, tracks: [...otherTracks, trackCopy] } };
    });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setMetadata = useCallback((peerId: string, trackId: string, metadata: any) => {
    setRemotePeers((prev: PeersMap) => {
      const peerCopy: RemotePeer = { ...prev[peerId] };
      const trackCopy: ApiTrack | undefined = copyTrack(peerCopy, trackId);
      if (!trackCopy) return prev;

      trackCopy.metadata = metadata;

      const otherTracks: ApiTrack[] = copyOtherTracks(peerCopy, trackId);

      return { ...prev, [peerId]: { ...peerCopy, tracks: [...otherTracks, trackCopy] } };
    });
  }, []);

  const setIsSpeaking = useCallback((peerId: string, trackId: string, vadStatus: VadStatus) => {
    setRemotePeers((prev: PeersMap) => {
      const peerCopy: RemotePeer = { ...prev[peerId] };
      const trackCopy: ApiTrack | undefined = copyTrack(peerCopy, trackId);
      if (!trackCopy) return prev;

      trackCopy.isSpeaking = vadStatus === "speech";

      const otherTracks: ApiTrack[] = copyOtherTracks(peerCopy, trackId);

      return { ...prev, [peerId]: { ...peerCopy, tracks: [...otherTracks, trackCopy] } };
    });
  }, []);

  const removeTrack = useCallback((peerId: string, trackId: string) => {
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
      setIsSpeaking,
      setLocalPeer,
      setLocalStream,
      setLocalTrackId,
      setLocalTrackMetadata,
      setMetadata,
    }),
    [
      addPeers,
      removePeer,
      addTrack,
      removeTrack,
      setEncoding,
      setIsSpeaking,
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
