import { useEffect } from "react";
import { PeersApi } from "./usePeerState";
import { TrackType } from "../../types";

export function useLocalPeerStreamLifecycle(type: TrackType, trackIds: string[], api: PeersApi, stream?: MediaStream) {
  useEffect(() => {
    if (!api) return;

    api.setLocalStreams(type, trackIds[0], stream);
  }, [type, api, stream, trackIds]);
}
