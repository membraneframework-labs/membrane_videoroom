import { useEffect } from "react";
import type { PeersApi } from "./usePeerState";
import type { TrackType } from "../../types";

export const useSetRemoteTrackId = (type: TrackType, trackId: string | null, api: PeersApi | null) => {
  useEffect(() => {
    if (!api) return;
    api.setLocalTrackId(type, trackId);
  }, [type, api, trackId]);
};
