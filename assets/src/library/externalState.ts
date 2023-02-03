import { LibraryPeersState } from "./state.types";

export type SetStore<PeerMetadataGeneric, TrackMetadataGeneric> = (
  setter: (
    prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>
  ) => LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>
) => void;

export type ExternalState<PeerMetadataGeneric, TrackMetadataGeneric> = {
  getSnapshot: () => LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>;
  setStore: SetStore<PeerMetadataGeneric, TrackMetadataGeneric>;
  subscribe: (onStoreChange: () => void) => () => void;
};

export type Listener = () => void;

export const DEFAULT_STORE = {
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
  },
};

export const createStore = <PeerMetadataGeneric, TrackMetadataGeneric>(): ExternalState<
  PeerMetadataGeneric,
  TrackMetadataGeneric
> => {
  type StateType = LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>;

  let listeners: Listener[] = [];
  let store: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric> = DEFAULT_STORE;

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
export type Subscribe = (onStoreChange: () => void) => () => void;
