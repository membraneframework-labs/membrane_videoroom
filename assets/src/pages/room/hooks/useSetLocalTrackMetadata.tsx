import { useEffect } from "react";
import { PeersApi } from "./usePeerState";
import { TrackType } from "../../types";

export const useSetLocalTrackMetadata = (type: TrackType, api: PeersApi, metadata: any) => {
  useEffect(() => {
    console.log("updating track metadata")
    api.setLocalTrackMetadata(type, metadata);
  }, [type, api, metadata]);
};
