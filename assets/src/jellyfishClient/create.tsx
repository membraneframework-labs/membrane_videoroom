import React, { createContext, Dispatch, useContext, useMemo, useReducer } from "react";
import type { State, Selector } from "./state.types";
import { DEFAULT_STORE } from "./state";
import {
  onAuthError,
  onAuthSuccess,
  onBandwidthEstimationChanged,
  onDisconnected,
  onEncodingChanged,
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
  onVoiceActivityChanged,
} from "./stateMappers";
import { createApiWrapper } from "./api";
import { Peer } from "@jellyfish-dev/membrane-webrtc-js";
import { Config, JellyfishClient } from "./JellyfishClient";

export type JellyfishContextProviderProps = {
  children: React.ReactNode;
};

type JellyfishContextType<PeerMetadata, TrackMetadata> = {
  state: State<PeerMetadata, TrackMetadata>;
  dispatch: Dispatch<Action<PeerMetadata>>;
};

export type UseConnect<PeerMetadata> = (config: Config<PeerMetadata>) => () => void;

export const createDefaultState = <PeerMetadata, TrackMetadata>(): State<PeerMetadata, TrackMetadata> => {
  // console.log("Creating new client");

  return {
    local: null,
    remote: {},
    status: null,
    bandwidthEstimation: BigInt(0), // todo investigate bigint n notation
    connectivity: {
      api: null,
      client: new JellyfishClient<PeerMetadata, TrackMetadata>(crypto.randomUUID()),
    },
  };
};

export type ConnectAction<PeerMetadata> = {
  type: "connect";
  config: Config<PeerMetadata>;
  dispatch: Dispatch<Action<PeerMetadata>>;
};

export type DisconnectAction = {
  type: "disconnect";
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

export type Action<PeerMetadata> =
  | ConnectAction<PeerMetadata>
  | DisconnectAction
  | OnJoinSuccessAction<PeerMetadata>
  | OnAuthSuccessAction
  | OnSocketOpenAction;

const handleConnectAction = <PeerMetadata, TrackMetadata>(
  state: State<PeerMetadata, TrackMetadata>,
  action: ConnectAction<PeerMetadata>
): State<PeerMetadata, TrackMetadata> => {
  console.log({ name: "handleConnectAction" });
  const { peerMetadata } = action.config;

  const client: JellyfishClient<PeerMetadata, TrackMetadata> | null = state?.connectivity.client;

  if (client === null) {
    console.log({ state, action });
    throw Error("Client is null");
  }

  client.on("onSocketOpen", () => {
    console.log({ name: "$$-onSocketOpen+" });
    action.dispatch({ type: "onSocketOpen" });
  });

  client.on("onSocketError", () => {
    console.log({ name: "$$-onSocketError" });

    // setStore(onSocketError());
  });

  client.on("onAuthSuccess", () => {
    console.log({ name: "$$-onAuthSuccess+" });
    action.dispatch({ type: "onAuthSuccess" });
  });

  client.on("onAuthError", () => {
    console.log({ name: "$$-onAuthError" });

    // setStore(onAuthError());
  });

  client.on("onDisconnected", () => {
    console.log({ name: "$$-onDisconnected" });

    // setStore(onDisconnected());
  });

  client.on("onJoinSuccess", (peerId, peersInRoom) => {
    console.log({ name: "$$-onJoinSuccess+" });

    action.dispatch({ type: "onJoinSuccess", peersInRoom, peerId, peerMetadata });
  });
  // todo handle state and handle callback
  client.on("onJoinError", (metadata) => {
    console.log({ name: "$$-onJoinError" });

    // setStore(onJoinError(metadata));
  });
  client.on("onRemoved", (reason) => {
    console.log({ name: "$$-onRemoved" });

    // setStore(onPeerRemoved(reason));
  });
  client.on("onPeerJoined", (peer) => {
    console.log({ name: "$$-onPeerJoined" });

    // return setStore(onPeerJoined(peer));
  });
  client.on("onPeerUpdated", (peer) => {
    console.log({ name: "$$-onPeerUpdated" });

    // setStore(onPeerUpdated(peer));
  });
  client.on("onPeerLeft", (peer) => {
    console.log({ name: "$$-onPeerLeft" });

    // setStore(onPeerLeft(peer));
  });
  client.on("onTrackReady", (ctx) => {
    console.log({ name: "$$-onTrackReady" });

    // setStore(onTrackReady(ctx));
  });
  client.on("onTrackAdded", (ctx) => {
    console.log({ name: "$$-onTrackAdded" });

    // setStore(onTrackAdded(ctx));
    // ctx.on("onEncodingChanged", () => {
    //   setStore(onEncodingChanged(ctx));
    // });
    // ctx.on("onVoiceActivityChanged", () => {
    //   setStore(onVoiceActivityChanged(ctx));
    // });
  });
  client.on("onTrackRemoved", (ctx) => {
    console.log({ name: "$$-onTrackRemoved" });

    // setStore(onTrackRemoved(ctx));
  });
  client.on("onTrackUpdated", (ctx) => {
    console.log({ name: "$$-onTrackUpdated" });

    // setStore(onTrackUpdated(ctx));
  });
  client.on("onBandwidthEstimationChanged", (estimation) => {
    console.log({ name: "$$-onBandwidthEstimationChanged" });

    // setStore(onBandwidthEstimationChanged(estimation));
  });
  client.on("onTrackEncodingChanged", (peerId, trackId, encoding) => {
    console.log({ name: "$$-onTrackEncodingChanged" });

    // setStore(onTrackEncodingChanged(peerId, trackId, encoding));
  });
  // todo handle state
  client.on("onTracksPriorityChanged", (enabledTracks, disabledTracks) => {
    console.log({ name: "$$-onTracksPriorityChanged" });

    // setStore(onTracksPriorityChanged(enabledTracks, disabledTracks));
  });

  console.log({ name: "Start connecting", config: action.config });
  client.connect(action.config);

  // setStore((prevState: State<PeerMetadata, TrackMetadata>): State<PeerMetadata, TrackMetadata> => {
  //   return {
  //     ...prevState,
  //     status: "connecting",
  //     connectivity: {
  //       ...prevState.connectivity,
  //       api: client ? createApiWrapper(client, setStore) : null,
  //       client: client,
  //     },
  //   };
  // });
  return {
    ...state,
    status: "connecting",
    connectivity: {
      ...state.connectivity,
      // api: client ? createApiWrapper(client, setStore) : null,
      client: client,
    },
  };
};

const reducer = <PeerMetadata, TrackMetadata>(
  state: State<PeerMetadata, TrackMetadata>,
  action: Action<PeerMetadata>
): State<PeerMetadata, TrackMetadata> => {
  console.log({ name: "reducer", state, action });
  switch (action.type) {
    case "connect":
      console.log("reducer-connect");
      return handleConnectAction<PeerMetadata, TrackMetadata>(state, action);
    case "disconnect":
      console.log("reducer-disconnect");
      state?.connectivity?.client?.removeAllListeners();
      state?.connectivity?.client?.cleanUp();
      return createDefaultState();
    case "onJoinSuccess":
      console.log("reducer-onJoinSuccess");
      return onJoinSuccess<PeerMetadata, TrackMetadata>(action.peersInRoom, action.peerId, action.peerMetadata)(state);
    case "onAuthSuccess":
      console.log("reducer-onAuthSuccess");
      return onAuthSuccess<PeerMetadata, TrackMetadata>()(state);
    case "onSocketOpen":
      console.log("reducer-onSocketOpen");
      return onSocketOpen<PeerMetadata, TrackMetadata>()(state);
  }

  return DEFAULT_STORE;
};

/**
 * Create a client that can be used with a context.
 * Returns context provider, and two hooks to interact with the context.
 *
 * @returns ContextProvider, useSelector, useConnect
 */
export const create = <PeerMetadata, TrackMetadata>() => {
  const JellyfishContext = createContext<JellyfishContextType<PeerMetadata, TrackMetadata> | undefined>(undefined);

  const JellyfishContextProvider = ({ children }: JellyfishContextProviderProps) => {
    const [state, dispatch] = useReducer<
      (state: State<PeerMetadata, TrackMetadata>, action: Action<PeerMetadata>) => State<PeerMetadata, TrackMetadata>,
      State<PeerMetadata, TrackMetadata>
    >(reducer, DEFAULT_STORE, () => createDefaultState());

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
