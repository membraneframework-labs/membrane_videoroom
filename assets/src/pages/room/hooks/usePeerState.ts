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
  id: string;
  displayName?: string;
  emoji?: string;
  tracks: Track[];
};

export type TrackType = "screensharing" | "camera" | "audio";

export type Peers = {
  [peerId: string]: LocalPeer;
};

export type NewPeer = {
  id: string;
  displayName?: string;
  emoji?: string;
};

export type Metadata = {
  type?: TrackType;
};

type UsePeersStateResult = {
  peers: Peers;
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

export function usePeersState(): UsePeersStateResult {
  const [peers, setPeers] = useState<Peers>({});

  // todo should I change it to useCallback?
  const addPeers = (peerIds: NewPeer[]) => {
    setPeers((prevState: Peers) => {
      const newPeers: Peers = Object.fromEntries(
        peerIds.map((peer) => [
          peer.id,
          {
            id: peer.id,
            tracks: [],
            removedTracks: [],
            displayName: peer.displayName,
            emoji: peer.emoji,
          },
        ])
      );
      return { ...prevState, ...newPeers };
    });
  };

  // todo should I change it to useCallback?
  const removePeer = (peerId: string) => {
    setPeers((prev) => {
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
    setPeers((prev: Peers) => {
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
    setPeers((prev: Peers) => {
      const peerCopy: LocalPeer = { ...prev[peerId] };
      const trackCopy: Track | undefined = peerCopy.tracks.filter((track) => track.trackId === trackId)[0];
      const otherTracks = peerCopy.tracks.filter((track) => track.trackId !== trackId);
      if (trackCopy) {
        trackCopy.encoding = encoding;
      }

      console.log({ name: "setEncoding" });
      return { ...prev, [peerId]: { ...peerCopy, tracks: [...otherTracks, trackCopy] } };
    });
  };

  // todo should I change it to useCallback?
  const removeTrack = (peerId: string, trackId: string) => {
    setPeers((prev) => {
      const newState = { ...prev };
      const peerCopy: LocalPeer = { ...prev[peerId] };
      const newPeer: LocalPeer = {
        ...peerCopy,
        tracks: peerCopy.tracks.filter((e) => e.trackId !== trackId),
      };
      delete newState[peerId];
      return { ...newState, [peerId]: newPeer };
    });
  };

  return { peers, addPeers, removePeer, addTrack, removeTrack, setEncoding };
}
