import { useCallback, useMemo, useSyncExternalStore } from "react";
import { cache } from "./cache";
import { Selector, Subscribe } from "./types";
import { Listener, Store } from "./store";

export const useSelector = <Result, PeerMetadataGeneric, TrackMetadataGeneric>(
  store: Store<PeerMetadataGeneric, TrackMetadataGeneric> | null,
  selector: Selector<PeerMetadataGeneric, TrackMetadataGeneric, Result>
): Result => {
  const cachedSelector: Selector<PeerMetadataGeneric, TrackMetadataGeneric, Result> = useMemo(
    () => cache(selector),
    [selector]
  );

  const subscribe: Subscribe = useCallback(
    (listener: Listener) => {
      const sub: Subscribe | undefined = store?.subscribe;

      // return () => {};
      // todo refactor add guard statement
      if (!sub) {
        return () => {};
      } else {
        return sub(listener);
      }
    },
    [store]
  );

  const getSnapshotWithSelector = useCallback(() => {
    return cachedSelector(store?.getSnapshot() || null);
  }, [store, cachedSelector]);

  const result: Result = useSyncExternalStore(subscribe, getSnapshotWithSelector);

  // useLog(result, "useSelector");

  return result;
};
