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

export type LocalPeer = {
  id: string;
  metadata?: PeerMetadata;
  videoTrackStream?: MediaStream;
  videoTrackId?: string;
  audioTrackStream?: MediaStream;
  audioTrack?: string;
  screenSharingTrackStream?: MediaStream;
  screenSharingTrackId?: string;
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
  setEncoding: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  setLocalPeer: (id: string, metadata?: PeerMetadata) => void;
  setLocalStreams: (type: TrackType, trackId: string, stream?: MediaStream) => void;
};

type UsePeersStateResult = {
  state: PeersState;
  api: PeersApi;
};

export type PeerMetadata = {
  emoji?: string;
  displayName?: string;
};

export function usePeersState(): UsePeersStateResult {
  const [remotePeers, setRemotePeers] = useState<PeersMap>({});
  const [localPeerState, setLocalPeerState] = useState<LocalPeer | undefined>();

  const setLocalPeer = useCallback((id: string, metadata?: PeerMetadata) => {
    setLocalPeerState(() => ({ id: id, metadata: metadata }));
  }, []);

  const setLocalStreams = useCallback((type: TrackType, trackId: string, stream?: MediaStream) => {
    setLocalPeerState((prevState: LocalPeer | undefined) => {
      if (!prevState) return prevState;

      if (type == "camera") return { ...prevState, videoTrackStream: stream, videoTrackId: trackId };
      if (type == "screensharing")
        return {
          ...prevState,
          screenSharingTrackStream: stream,
          screenSharingTrackId: trackId,
        };
      if (type == "audio") return { ...prevState, audioTrackStream: stream, audioTrack: trackId };
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
            emoji: peer.emoji,
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
      mediaStreamTrack?: MediaStreamTrack,
      mediaStream?: MediaStream,
      metadata?: TrackMetadata
    ) => {
      setRemotePeers((prev: PeersMap) => {
        const peerCopy: RemotePeer = { ...prev[peerId] };
        const oldTracks: Track[] = peerCopy.tracks.filter((e) => e.trackId !== trackId);

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
    setRemotePeers((prev: PeersMap) => {
      const peerCopy: RemotePeer = { ...prev[peerId] };
      const trackCopy: Track | undefined = peerCopy.tracks.find((track) => track.trackId === trackId);
      if (!trackCopy) return prev;

      const otherTracks = peerCopy.tracks.filter((track) => track.trackId !== trackId);
      trackCopy.encoding = encoding;

      return { ...prev, [peerId]: { ...peerCopy, tracks: [...otherTracks, trackCopy] } };
    });
  }, []);

  const removeTrack = useCallback((peerId: string, trackId: string) => {
    setRemotePeers((prev) => {
      const newState: PeersMap = { ...prev };
      const peerCopy: RemotePeer = { ...prev[peerId] };
      const newPeer: RemotePeer = {
        ...peerCopy,
        tracks: peerCopy.tracks.filter((e) => e.trackId !== trackId),
      };
      delete newState[peerId];
      return { ...newState, [peerId]: newPeer };
    });
  }, []);

  const api: PeersApi = useMemo(() => {
    return { addPeers, removePeer, addTrack, removeTrack, setEncoding, setLocalPeer, setLocalStreams };
  }, [addPeers, removePeer, addTrack, removeTrack, setEncoding, setLocalPeer, setLocalStreams]);

  const state: PeersState = useMemo(() => {
    const remoteUsersArray: RemotePeer[] = Object.values(remotePeers);

    return {
      local: localPeerState,
      remote: remoteUsersArray,
    };
  }, [localPeerState, remotePeers]);

  return { state, api };
}
