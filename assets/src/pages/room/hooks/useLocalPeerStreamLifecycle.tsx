import { useEffect } from "react";
import { PeersApi } from "./usePeerState";
import { TrackType } from "../../types";

export function useLocalPeerStreamLifecycle(type: TrackType, api: PeersApi, stream?: MediaStream, userCameraStreamId?: string) {
  useEffect(() => {
    if (!api) return;
    api.setLocalTrack(type, stream, userCameraStreamId);
  }, [type, api, stream, userCameraStreamId]);
}
