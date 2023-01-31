import { useCallback, useMemo, useSyncExternalStore } from "react";
import { cache } from "./cache";
import {Selector, Subscribe, UseMembraneClientType} from "./types";
import { Listener } from "./store";

export const useSelector = <Result, PeerMetadataGeneric, TrackMetadataGeneric>(
  clientWrapper: UseMembraneClientType<PeerMetadataGeneric, TrackMetadataGeneric> | null,
  selector: Selector<PeerMetadataGeneric, TrackMetadataGeneric, Result>
): Result => {
  const cachedSelector: Selector<PeerMetadataGeneric, TrackMetadataGeneric, Result> = useMemo(
    () => cache(selector),
    [selector]
  );

  const subscribe: Subscribe = useCallback(
    (listener: Listener) => {
      const sub: Subscribe | undefined = clientWrapper?.store?.subscribe;

      // return () => {};
      // todo refactor add guard statement
      if (!sub) {
        return () => {};
      } else {
        return sub(listener);
      }
    },
    [clientWrapper]
  );

  const getSnapshotWithSelector = useCallback(() => {
    return cachedSelector(clientWrapper?.store?.getSnapshot() || null);
  }, [clientWrapper, cachedSelector]);

  const result: Result = useSyncExternalStore(subscribe, getSnapshotWithSelector);

  // useLog(result, "useSelector");

  return result;
};
