import { useState } from "react";
import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";

export type Track = {
  trackId: string;
  mediaStreamTrack?: MediaStreamTrack;
  mediaStream?: MediaStream;
  metadata?: Metadata;
  encoding?: TrackEncoding;
};

export type LocalPeer = {
  tracks: Track[];
} & NewPeer;

export type TrackType = "screensharing" | "camera" | "audio";

type PeersMap = {
  [peerId: string]: LocalPeer;
};

// todo move display name and emoji to metadata
export type NewPeer = {
  id: string;
  displayName?: string;
  emoji?: string;
  source: "local" | "remote";
};

export type Metadata = {
  type?: TrackType;
};

export type PeersState = {
  local?: LocalPeer;
  remote: LocalPeer[];
};

export type PeersApi = {
  addLocalPeer: (peer: NewPeer) => void;
  addPeers: (peerId: NewPeer[]) => void;
  removePeer: (peerId: string) => void;
  addTrack: (
    peerId: string,
    trackId: string,
    mediaStreamTrack?: MediaStreamTrack,
    mediaStream?: MediaStream,
    metadata?: Metadata
  ) => void;
  removeTrack: (peerId: string, trackId: string) => void;
  setEncoding: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
};

type UsePeersStateResult = {
  state: PeersState;
  api: PeersApi;
};

export function usePeersState(): UsePeersStateResult {
  const [remotePeers, setRemotePeers] = useState<PeersMap>({});
  const [localPeer, setLocalPeer] = useState<LocalPeer | undefined>();

  const addLocalPeer = (peer: NewPeer) => {
    setLocalPeer(() => {
      return { ...peer, tracks: [] };
    });
  };

  // todo should I change it to useCallback?
  const addPeers = (peerIds: NewPeer[]) => {
    setRemotePeers((prevState: PeersMap) => {
      const newPeers: PeersMap = Object.fromEntries(
        peerIds.map((peer) => [
          peer.id,
          {
            id: peer.id,
            tracks: [],
            removedTracks: [],
            displayName: peer.displayName,
            emoji: peer.emoji,
            source: peer.source,
          },
        ])
      );
      return { ...prevState, ...newPeers };
    });
  };

  // todo should I change it to useCallback?
  const removePeer = (peerId: string) => {
    setRemotePeers((prev) => {
      const newState = { ...prev };
      delete newState[peerId];
      return newState;
    });
  };

  // todo should I change it to useCallback?
  const addTrack = (
    peerId: string,
    trackId: string,
    mediaStreamTrack?: MediaStreamTrack,
    mediaStream?: MediaStream,
    metadata?: Metadata
  ) => {
    setRemotePeers((prev: PeersMap) => {
      const peerCopy: LocalPeer = { ...prev[peerId] };
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
  };

  // todo should I change it to useCallback?
  const setEncoding = (peerId: string, trackId: string, encoding: TrackEncoding) => {
    setRemotePeers((prev: PeersMap) => {
      const peerCopy: LocalPeer = { ...prev[peerId] };
      const trackCopy: Track | undefined = peerCopy.tracks.filter((track) => track.trackId === trackId)[0];
      const otherTracks = peerCopy.tracks.filter((track) => track.trackId !== trackId);
      if (trackCopy) {
        trackCopy.encoding = encoding;
      }

      // console.log({ name: "setEncoding" });
      return { ...prev, [peerId]: { ...peerCopy, tracks: [...otherTracks, trackCopy] } };
    });
  };

  // todo should I change it to useCallback?
  const removeTrack = (peerId: string, trackId: string) => {
    setRemotePeers((prev) => {
      const newState: PeersMap = { ...prev };
      const peerCopy: LocalPeer = { ...prev[peerId] };
      const newPeer: LocalPeer = {
        ...peerCopy,
        tracks: peerCopy.tracks.filter((e) => e.trackId !== trackId),
      };
      delete newState[peerId];
      return { ...newState, [peerId]: newPeer };
    });
  };

  return {
    state: { local: localPeer, remote: Object.values(remotePeers) },
    api: { addPeers, removePeer, addTrack, removeTrack, setEncoding, addLocalPeer },
  };
}
