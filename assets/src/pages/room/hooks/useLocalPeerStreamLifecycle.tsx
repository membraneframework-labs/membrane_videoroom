import { useEffect } from "react";
import { PeersApi, TrackType } from "./usePeerState";

export function useLocalPeerStreamLifecycle(type: TrackType, api: PeersApi, stream?: MediaStream, userCameraStreamId?: string) {
  useEffect(() => {
    if (!api) return;
    api.setLocalTrack(type, stream, userCameraStreamId);
  }, [type, api, stream, userCameraStreamId]);
}
