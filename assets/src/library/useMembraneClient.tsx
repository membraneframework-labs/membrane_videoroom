import { useSyncMembraneWebRTCState } from "./useMembraneWebRTCWrapper";
import { DEFAULT_STORE } from "./externalState";
import { useState } from "react";
import { LibraryPeersState } from "./state.types";

export const useMembraneClient = <PeerMetadataGeneric, TrackMetadataGeneric>(
  roomId: string,
  peerMetadata: PeerMetadataGeneric,
  isSimulcastOn: boolean
) => {
  const [state, setState] = useState<LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>>(DEFAULT_STORE);

  useSyncMembraneWebRTCState(setState, roomId, peerMetadata, isSimulcastOn);

  return state;
};
