import { useLibraryMembraneClient2 } from "./useLibraryMembraneClient2";
import { createStore } from "./store";

export const createMembraneClient = <PeerMetadataGeneric, TrackMetadataGeneric>() => {
  const store = createStore<PeerMetadataGeneric, TrackMetadataGeneric>();

  return {
    useClient: () => {
      return useLibraryMembraneClient2(store);
    },
  };
};
