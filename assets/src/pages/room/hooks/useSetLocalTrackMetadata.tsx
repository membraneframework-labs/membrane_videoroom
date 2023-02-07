import { useEffect } from "react";
import type { PeersApi } from "./usePeerState";
import type { TrackType } from "../../types";

export const useSetLocalTrackMetadata = (
  type: TrackType,
  api: PeersApi,
  metadata: any // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  useEffect(() => {
    api.setLocalTrackMetadata(type, metadata);
  }, [type, api, metadata]);
};
