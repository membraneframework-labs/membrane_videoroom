import { useEffect } from "react";
import { PeersApi } from "./usePeerState";
import { TrackType } from "../../types";

export const useSetRemoteTrackId = (type: TrackType, trackIds: string | null, api: PeersApi | null) => {
  useEffect(() => {
    if (!api) return;
    api.setLocalTrackId(type, trackIds);
  }, [type, api, trackIds]);
};
