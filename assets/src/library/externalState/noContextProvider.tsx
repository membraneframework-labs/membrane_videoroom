import type { ExternalState } from "./externalState";
import { createStore } from "./externalState";
import { useSelector } from "./useSelector";
import type { Selector } from "../state.types";
import { useMemo } from "react";
import { connect } from "../connect";

export const createMembraneClient = <PeerMetadataGeneric, TrackMetadataGeneric>() => {
  const store: ExternalState<PeerMetadataGeneric, TrackMetadataGeneric> = createStore<
    PeerMetadataGeneric,
    TrackMetadataGeneric
  >();

  return {
    useConnect: () => {
      return useMemo(() => connect(store.setStore), []);
    },
    useSelector: <Result,>(selector: Selector<PeerMetadataGeneric, TrackMetadataGeneric, Result>): Result => {
      return useSelector(store, selector);
    },
  };
};
