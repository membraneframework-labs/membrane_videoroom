import type { ExternalState } from "./externalState";
import { createStore } from "./externalState";
import { useSelector } from "./useSelector";
import type { Selector } from "../state.types";
import { useMemo } from "react";
import { Config } from "../JellyfishClient";

export type CreateNoContextJellyfishClient<PeerMetadata, TrackMetadata> = {
  useConnect: () => (config: Config<PeerMetadata>) => () => void;
  useSelector: <Result>(selector: Selector<PeerMetadata, TrackMetadata, Result>) => Result;
};

/**
 * Create a client that can be used without a context.
 *
 * @returns client
 *
 */
export const create = <PeerMetadata, TrackMetadata>(): CreateNoContextJellyfishClient<PeerMetadata, TrackMetadata> => {
  const store: ExternalState<PeerMetadata, TrackMetadata> = createStore<PeerMetadata, TrackMetadata>();

  return {
    useConnect: () => {
      // todo remove use memo?
      return useMemo(() => {
        const { dispatch } = store;
        return (config: Config<PeerMetadata>): (() => void) => {
          dispatch({ type: "connect", config, dispatch });
          return () => {
            dispatch({ type: "disconnect" });
          };
        };
      }, []);
    },
    useSelector: <Result,>(selector: Selector<PeerMetadata, TrackMetadata, Result>): Result => {
      return useSelector(store, selector);
    },
  };
};
