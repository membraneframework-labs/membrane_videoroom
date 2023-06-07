import React, { createContext, Dispatch, useContext, useMemo, useReducer } from "react";
import type { Selector, State } from "./state.types";
import { DEFAULT_STORE } from "./state";
import {
  addTrack,
  onAuthError,
  onAuthSuccess,
  onBandwidthEstimationChanged,
  onJoinError,
  onJoinSuccess,
  onPeerJoined,
  onPeerLeft,
  onPeerRemoved,
  onPeerUpdated,
  onSocketError,
  onSocketOpen,
  onTrackAdded,
  onTrackEncodingChanged,
  onTrackReady,
  onTrackRemoved,
  onTracksPriorityChanged,
  onTrackUpdated,
  removeTrack,
  replaceTrack,
  updateTrackMetadata,
} from "./stateMappers";
import { createApiWrapper } from "./api";
import { Peer, SimulcastConfig, TrackContext, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { Config, JellyfishClient } from "./JellyfishClient";

export type JellyfishContextProviderProps = {
  children: React.ReactNode;
};

type JellyfishContextType<PeerMetadata, TrackMetadata> = {
  state: State<PeerMetadata, TrackMetadata>;
  dispatch: Dispatch<Action<PeerMetadata, TrackMetadata>>;
};

export type UseConnect<PeerMetadata> = (config: Config<PeerMetadata>) => () => void;

export const createDefaultState = <PeerMetadata, TrackMetadata>(): State<PeerMetadata, TrackMetadata> => ({
  local: null,
  remote: {},
  status: null,
  bandwidthEstimation: BigInt(0), // todo investigate bigint n notation
  connectivity: {
    api: null,
    client: new JellyfishClient<PeerMetadata, TrackMetadata>(),
  },
});

export type ConnectAction<PeerMetadata, TrackMetadata> = {
  type: "connect";
  config: Config<PeerMetadata>;
  dispatch: Dispatch<Action<PeerMetadata, TrackMetadata>>;
};

export type DisconnectAction = {
  type: "disconnect";
};

export type OnJoinErrorAction = {
  type: "onJoinError";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
};

export type OnSocketErrorAction = {
  type: "onSocketError";
};

export type OnAuthErrorAction = {
  type: "onAuthError";
};

export type OnJoinSuccessAction<PeerMetadata> = {
  type: "onJoinSuccess";
  peerMetadata: PeerMetadata;
  peersInRoom: [Peer];
  peerId: string;
};

export type OnAuthSuccessAction = {
  type: "onAuthSuccess";
};

export type OnSocketOpenAction = {
  type: "onSocketOpen";
};
export type OnRemovedAction = {
  type: "onRemoved";
  reason: string;
};

export type OnDisconnectedAction = {
  type: "onDisconnected";
};

export type OnTrackAddedAction = {
  type: "onTrackAdded";
  ctx: TrackContext;
};

export type OnTrackReadyAction = {
  type: "onTrackReady";
  ctx: TrackContext;
};

export type OnTrackRemovedAction = {
  type: "onTrackRemoved";
  ctx: TrackContext;
};

export type OnTrackUpdatedAction = {
  type: "onTrackUpdated";
  ctx: TrackContext;
};

export type OnBandwidthEstimationChangedAction = {
  type: "onBandwidthEstimationChanged";
  estimation: bigint;
};

export type OnTrackEncodingChangedAction = {
  type: "onTrackEncodingChanged";
  peerId: string;
  trackId: string;
  encoding: TrackEncoding;
};

export type OnTracksPriorityChangedAction = {
  type: "onTracksPriorityChanged";
  enabledTracks: TrackContext[];
  disabledTracks: TrackContext[];
};

export type OnPeerJoinedAction = {
  type: "onPeerJoined";
  peer: Peer;
};

export type OnPeerLeftAction = {
  type: "onPeerLeft";
  peer: Peer;
};

export type OnPeerUpdatedAction = {
  type: "onPeerUpdated";
  peer: Peer;
};

// Local
export type LocalAddTrackAction<TrackMetadata> = {
  type: "localAddTrack";
  remoteTrackId: string;
  track: MediaStreamTrack;
  stream: MediaStream;
  trackMetadata?: TrackMetadata;
  simulcastConfig?: SimulcastConfig;
};

export type LocalReplaceTrackAction<TrackMetadata> = {
  type: "localReplaceTrack";
  trackId: string;
  newTrack: MediaStreamTrack;
  stream: MediaStream;
  newTrackMetadata?: TrackMetadata;
};

export type LocalRemoveTrackAction = {
  type: "localRemoveTrack";
  trackId: string;
};

export type LocalUpdateTrackMetadataAction<TrackMetadata> = {
  type: "localUpdateTrackMetadata";
  trackId: string;
  trackMetadata: TrackMetadata;
};

export type Action<PeerMetadata, TrackMetadata> =
  | ConnectAction<PeerMetadata, TrackMetadata>
  | DisconnectAction
  | OnJoinSuccessAction<PeerMetadata>
  | OnAuthSuccessAction
  | OnSocketOpenAction
  | OnSocketErrorAction
  | OnAuthErrorAction
  | OnDisconnectedAction
  | OnRemovedAction
  | OnTrackReadyAction
  | OnTrackAddedAction
  | OnTrackUpdatedAction
  | OnTrackRemovedAction
  | OnBandwidthEstimationChangedAction
  | OnTrackEncodingChangedAction
  | OnTracksPriorityChangedAction
  | OnPeerUpdatedAction
  | OnPeerLeftAction
  | OnPeerJoinedAction
  | OnJoinErrorAction
  | LocalReplaceTrackAction<TrackMetadata>
  | LocalRemoveTrackAction
  | LocalUpdateTrackMetadataAction<TrackMetadata>
  | LocalAddTrackAction<TrackMetadata>;

const onConnect = <PeerMetadata, TrackMetadata>(
  state: State<PeerMetadata, TrackMetadata>,
  action: ConnectAction<PeerMetadata, TrackMetadata>
): State<PeerMetadata, TrackMetadata> => {
  const client: JellyfishClient<PeerMetadata, TrackMetadata> | null = state?.connectivity.client;

  const { peerMetadata } = action.config;

  if (client === null) {
    console.log({ state, action });
    throw Error("Client is null");
  }

  const api = state?.connectivity.api ? state?.connectivity.api : createApiWrapper(client, action.dispatch);

  if (client?.status === "initialized") {
    return {
      ...state,
      status: "connecting",
      connectivity: {
        ...state.connectivity,
        api,
        client,
      },
    };
  }

  client.on("onSocketOpen", () => {
    action.dispatch({ type: "onSocketOpen" });
  });

  client.on("onSocketError", () => {
    action.dispatch({ type: "onSocketError" });
  });

  client.on("onAuthSuccess", () => {
    action.dispatch({ type: "onAuthSuccess" });
  });

  client.on("onAuthError", () => {
    action.dispatch({ type: "onAuthError" });
  });

  client.on("onDisconnected", () => {
    action.dispatch({ type: "onDisconnected" });
  });

  client.on("onJoinSuccess", (peerId, peersInRoom) => {
    action.dispatch({ type: "onJoinSuccess", peersInRoom, peerId, peerMetadata });
  });
  // todo handle state and handle callback
  client.on("onJoinError", (metadata) => {
    action.dispatch({ type: "onJoinError", metadata });
  });
  client.on("onRemoved", (reason) => {
    action.dispatch({ type: "onRemoved", reason });
  });
  client.on("onPeerJoined", (peer) => {
    action.dispatch({ type: "onPeerJoined", peer });
  });
  client.on("onPeerUpdated", (peer) => {
    action.dispatch({ type: "onPeerUpdated", peer });
  });
  client.on("onPeerLeft", (peer) => {
    action.dispatch({ type: "onPeerLeft", peer });
  });
  client.on("onTrackReady", (ctx) => {
    action.dispatch({ type: "onTrackReady", ctx });
  });
  client.on("onTrackAdded", (ctx) => {
    action.dispatch({ type: "onTrackAdded", ctx });

    // setStore(onTrackAdded(ctx));
    // ctx.on("onEncodingChanged", () => {
    //   setStore(onEncodingChanged(ctx));
    // });
    // ctx.on("onVoiceActivityChanged", () => {
    //   setStore(onVoiceActivityChanged(ctx));
    // });
  });
  client.on("onTrackRemoved", (ctx) => {
    action.dispatch({ type: "onTrackRemoved", ctx });
  });
  client.on("onTrackUpdated", (ctx) => {
    action.dispatch({ type: "onTrackUpdated", ctx });
  });
  client.on("onBandwidthEstimationChanged", (estimation) => {
    action.dispatch({ type: "onBandwidthEstimationChanged", estimation });
  });
  client.on("onTrackEncodingChanged", (peerId, trackId, encoding) => {
    action.dispatch({ type: "onTrackEncodingChanged", peerId, trackId, encoding });
  });
  // todo handle state
  client.on("onTracksPriorityChanged", (enabledTracks, disabledTracks) => {
    action.dispatch({ type: "onTracksPriorityChanged", enabledTracks, disabledTracks });
  });

  client.connect(action.config);

  return {
    ...state,
    status: "connecting",
    connectivity: {
      ...state.connectivity,
      api,
      client: client,
    },
  };
};

export const reducer = <PeerMetadata, TrackMetadata>(
  state: State<PeerMetadata, TrackMetadata>,
  action: Action<PeerMetadata, TrackMetadata>
): State<PeerMetadata, TrackMetadata> => {
  switch (action.type) {
    // Internal events
    case "connect":
      return onConnect<PeerMetadata, TrackMetadata>(state, action);
    case "disconnect":
      state?.connectivity?.client?.removeAllListeners();
      state?.connectivity?.client?.cleanUp();
      return createDefaultState();
    // connections events
    case "onSocketOpen":
      return onSocketOpen<PeerMetadata, TrackMetadata>()(state);
    case "onSocketError":
      return onSocketError<PeerMetadata, TrackMetadata>()(state);
    case "onJoinSuccess":
      return onJoinSuccess<PeerMetadata, TrackMetadata>(action.peersInRoom, action.peerId, action.peerMetadata)(state);
    case "onJoinError":
      return onJoinError<PeerMetadata, TrackMetadata>(action.metadata)(state);
    case "onDisconnected":
      state?.connectivity?.client?.removeAllListeners();
      state?.connectivity?.client?.cleanUp();
      // return onDisconnected<PeerMetadata, TrackMetadata>()(state)
      return createDefaultState();
    case "onAuthSuccess":
      return onAuthSuccess<PeerMetadata, TrackMetadata>()(state);
    case "onAuthError":
      return onAuthError<PeerMetadata, TrackMetadata>()(state);
    case "onRemoved":
      return onPeerRemoved<PeerMetadata, TrackMetadata>(action.reason)(state);
    // this peer events
    case "onBandwidthEstimationChanged":
      return onBandwidthEstimationChanged<PeerMetadata, TrackMetadata>(action.estimation)(state);
    // remote peers events
    case "onPeerJoined":
      return onPeerJoined<PeerMetadata, TrackMetadata>(action.peer)(state);
    case "onPeerLeft":
      return onPeerLeft<PeerMetadata, TrackMetadata>(action.peer)(state);
    case "onPeerUpdated":
      return onPeerUpdated<PeerMetadata, TrackMetadata>(action.peer)(state);
    // remote track events
    case "onTrackAdded":
      return onTrackAdded<PeerMetadata, TrackMetadata>(action.ctx)(state);
    case "onTrackReady":
      return onTrackReady<PeerMetadata, TrackMetadata>(action.ctx)(state);
    case "onTrackUpdated":
      return onTrackUpdated<PeerMetadata, TrackMetadata>(action.ctx)(state);
    case "onTrackRemoved":
      return onTrackRemoved<PeerMetadata, TrackMetadata>(action.ctx)(state);
    case "onTrackEncodingChanged":
      return onTrackEncodingChanged<PeerMetadata, TrackMetadata>(action.peerId, action.trackId, action.encoding)(state);
    // local track events
    case "localAddTrack":
      return addTrack<PeerMetadata, TrackMetadata>(
        action.remoteTrackId,
        action.track,
        action.stream,
        action.trackMetadata,
        action.simulcastConfig
      )(state);
    case "localRemoveTrack":
      return removeTrack<PeerMetadata, TrackMetadata>(action.trackId)(state);
    case "localReplaceTrack":
      return replaceTrack<PeerMetadata, TrackMetadata>(
        action.trackId,
        action.newTrack,
        action.stream,
        action.newTrackMetadata
      )(state);
    case "localUpdateTrackMetadata":
      return updateTrackMetadata<PeerMetadata, TrackMetadata>(action.trackId, action.trackMetadata)(state);
    case "onTracksPriorityChanged":
      return onTracksPriorityChanged<PeerMetadata, TrackMetadata>(action.enabledTracks, action.disabledTracks)(state);
  }
  throw Error("Nie obslugiwany blad");
};

type Reducer<PeerMetadata, TrackMetadata> = (
  state: State<PeerMetadata, TrackMetadata>,
  action: Action<PeerMetadata, TrackMetadata>
) => State<PeerMetadata, TrackMetadata>;
/**
 * Create a client that can be used with a context.
 * Returns context provider, and two hooks to interact with the context.
 *
 * @returns ContextProvider, useSelector, useConnect
 */
export const create = <PeerMetadata, TrackMetadata>() => {
  const JellyfishContext = createContext<JellyfishContextType<PeerMetadata, TrackMetadata> | undefined>(undefined);

  const JellyfishContextProvider = ({ children }: JellyfishContextProviderProps) => {
    const [state, dispatch] = useReducer<Reducer<PeerMetadata, TrackMetadata>, State<PeerMetadata, TrackMetadata>>(
      reducer,
      DEFAULT_STORE,
      () => createDefaultState()
    );

    return <JellyfishContext.Provider value={{ state, dispatch }}>{children}</JellyfishContext.Provider>;
  };

  const useJellyfishContext = (): JellyfishContextType<PeerMetadata, TrackMetadata> => {
    const context = useContext(JellyfishContext);
    if (!context) throw new Error("useJellyfishContext must be used within a JellyfishContextProvider");
    return context;
  };

  const useSelector = <Result,>(selector: Selector<PeerMetadata, TrackMetadata, Result>): Result => {
    const { state } = useJellyfishContext();

    return useMemo(() => selector(state), [selector, state]);
  };

  const useConnect = (): UseConnect<PeerMetadata> => {
    const { dispatch }: JellyfishContextType<PeerMetadata, TrackMetadata> = useJellyfishContext();

    return useMemo(() => {
      return (config: Config<PeerMetadata>): (() => void) => {
        dispatch({ type: "connect", config, dispatch });
        return () => {
          dispatch({ type: "disconnect" });
        };
      };
    }, [dispatch]);
  };

  return {
    JellyfishContextProvider,
    useSelector,
    useConnect,
  };
};
