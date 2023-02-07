import { useCallback, useMemo, useSyncExternalStore } from "react";
import { cache } from "./cache";
import type { Selector } from "../state.types";
import type { ExternalState, Listener, Subscribe } from "./externalState";

const EMPTY_FUNCTION = () => undefined;

export const useSelector = <Result, PeerMetadataGeneric, TrackMetadataGeneric>(
  store: ExternalState<PeerMetadataGeneric, TrackMetadataGeneric> | null,
  selector: Selector<PeerMetadataGeneric, TrackMetadataGeneric, Result>
): Result => {
  const cachedSelector: Selector<PeerMetadataGeneric, TrackMetadataGeneric, Result> = useMemo(
    () => cache(selector),
    [selector]
  );

  const subscribe: Subscribe = useCallback(
    (listener: Listener) => {
      const sub: Subscribe | undefined = store?.subscribe;

      return sub ? sub(listener) : EMPTY_FUNCTION;
    },
    [store]
  );

  const getSnapshotWithSelector = useCallback(
    () => cachedSelector(store?.getSnapshot() || null),
    [store, cachedSelector]
  );

  return useSyncExternalStore(subscribe, getSnapshotWithSelector);
};
