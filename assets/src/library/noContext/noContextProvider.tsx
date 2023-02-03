import { useNoContextMembraneRTCWrapper } from "./useNoContextMembraneRTCWrapper";
import { createStore, ExternalState } from "../externalState";
import { useSelector } from "./useSelector";
import { LibraryLocalPeer, LibraryPeersState, LibraryRemotePeer, LibraryTrack, Selector, TrackId } from "../state.types";
import { Channel, Socket } from "phoenix";
import {
  MembraneWebRTC,
  Peer,
  SerializedMediaEvent,
  SimulcastConfig,
  TrackBandwidthLimit,
  TrackContext,
  TrackEncoding,
} from "@jellyfish-dev/membrane-webrtc-js";
import { StoreApi } from "../storeApi";

export type Something<TrackMetadataGeneric> = {
  api: StoreApi<TrackMetadataGeneric> | null;
};

export const createMembraneClient = <PeerMetadataGeneric, TrackMetadataGeneric>() => {
  const store: ExternalState<PeerMetadataGeneric, TrackMetadataGeneric> = createStore<
    PeerMetadataGeneric,
    TrackMetadataGeneric
  >();

  return {
    useClient: () => {
      return useNoContextMembraneRTCWrapper(store);
    },
    useSelector2: <Result,>(selector: Selector<PeerMetadataGeneric, TrackMetadataGeneric, Result>): Result => {
      return useSelector(store, selector);
    },
  };
};
