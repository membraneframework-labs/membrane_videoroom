import { DEFAULT_STORE } from "./externalState";
import { useEffect, useState } from "react";
import { LibraryPeersState } from "./state.types";
import { connectFunction } from "./connectFunction";

export const useMembraneClient = <PeerMetadataGeneric, TrackMetadataGeneric>(
  // roomId: string,
  // peerMetadata: PeerMetadataGeneric,
  // isSimulcastOn: boolean
) => {
  const [state, setState] = useState<LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>>(DEFAULT_STORE);

  useEffect(() => {
    console.log("Setting state!")
    setState((prevState) => ({
      ...prevState,
      connectivity: {
        ...prevState.connectivity,
        connect: connectFunction(setState),
      },
    }));
  }, []);

  // useSyncMembraneWebRTCState(setState, roomId, peerMetadata, isSimulcastOn);
  // useSyncMembraneWebRTCState(setState, roomId, peerMetadata, isSimulcastOn);

  return state;
};
