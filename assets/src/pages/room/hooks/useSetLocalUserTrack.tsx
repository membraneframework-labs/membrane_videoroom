import { useEffect } from "react";
import { PeersApi } from "./usePeerState";
import { TrackType } from "../../types";

export const useSetLocalUserTrack = (
  type: TrackType,
  api: PeersApi,
  stream: MediaStream | null,
  isEnabled: boolean
) => {
  useEffect(() => {
    // console.log({})
    api.setLocalStream(type, isEnabled, stream || undefined);
  }, [type, api, stream, isEnabled]);
};
