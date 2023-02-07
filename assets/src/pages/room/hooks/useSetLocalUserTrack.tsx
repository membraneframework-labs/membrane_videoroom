import { useEffect } from "react";
import type { PeersApi } from "./usePeerState";
import type { TrackType } from "../../types";

export const useSetLocalUserTrack = (
  type: TrackType,
  api: PeersApi,
  stream: MediaStream | undefined,
  isEnabled: boolean
) => {
  useEffect(() => {
    api.setLocalStream(type, isEnabled, stream);
  }, [type, api, stream, isEnabled]);
};
