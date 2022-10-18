import { useEffect, useState } from "react";

export type Track = {
  trackId: string;
  mediaStreamTrack?: MediaStreamTrack;
  mediaStream?: MediaStream;
  metadata?: Metadata;
};

export type LocalPeer = {
  id: string;
  tracks: Track[];
  removedTracks: string[];
};

export type Peers = {
  [peerId: string]: LocalPeer;
};

export type Metadata = {
  type?: "screensharing" | "camera";
};

type UsePeersStateResult = {
  peers: Peers;
  addPeers: (peerId: string[]) => void;
  removePeer: (peerId: string) => void;
  addTrack: (
    peerId: string,
    trackId: string,
    mediaStreamTrack?: MediaStreamTrack,
    mediaStream?: MediaStream,
    metadata?: Metadata
  ) => void;
  removeTrack: (peerId: string, trackId: string) => void;
};

export function usePeersState(): UsePeersStateResult {
  const [peers, setPeers] = useState<Peers>({});

  const addPeers = (peerIds: string[]) => {
    setPeers((prevState: Peers) => {
      const newPeers: Peers = Object.fromEntries(peerIds.map((id) => [id, { id: id, tracks: [], removedTracks: [] }]));
      return { ...prevState, ...newPeers };
    });
  };

  const removePeer = (peerId: string) => {
    setPeers((prev) => {
      const newState = { ...prev };
      delete newState[peerId];
      return newState;
    });
  };

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

  const removeTrack = (peerId: string, trackId: string) => {
    setPeers((prev) => {
      const newState = { ...prev };
      const peerCopy: LocalPeer = { ...prev[peerId] };
      const newPeer: LocalPeer = {
        ...peerCopy,
        tracks: peerCopy.tracks.filter((e) => e.trackId !== trackId),
        removedTracks: [...peerCopy.removedTracks, trackId],
      };
      delete newState[peerId];
      return { ...newState, [peerId]: newPeer };
    });
  };

  return { peers, addPeers, removePeer, addTrack, removeTrack };
}
