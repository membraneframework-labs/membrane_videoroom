import { LibraryPeersState } from "./types";

export type Store<PeerMetadataGeneric, TrackMetadataGeneric> = {
  getSnapshot: () => LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>;
  setStore: (
    setter: (
      prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>
    ) => LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>
  ) => void;
  subscribe: (onStoreChange: () => void) => () => void;
};

export type Listener = () => void;

export const createStore = <PeerMetadataGeneric, TrackMetadataGeneric>(): Store<
  PeerMetadataGeneric,
  TrackMetadataGeneric
> => {
  type StateType = LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>;

  let listeners: Listener[] = [];
  let store: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric> = {
    local: {
      id: null,
      tracks: {},
      metadata: null,
    },
    remote: {},
    connectivity: {
      api: null,
      webrtc: null,
      signaling: null,
      socket: null,
    }
  };

  const getSnapshot = (): StateType => {
    return store;
  };

  const subscribe: (onStoreChange: () => void) => () => void = (callback: Listener) => {
    listeners = [...listeners, callback];

    return () => {
      listeners = listeners.filter((e) => e !== callback);
    };
  };

  const setStore = (setter: (prevState: StateType) => StateType) => {
    store = setter(store);

    listeners.forEach((listener) => {
      listener();
    });

    console.log({ name: "fullStore", store });
  };

  return { getSnapshot, subscribe, setStore };
};
