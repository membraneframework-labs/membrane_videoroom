import { useEffect } from "react";
import { TrackType } from "../pages/types";
import { SetLocalTrackMetadata } from "./remove/useLoclPeerState";
import { TrackMetadata } from "./useLocalPeerState";

export const useSetLocalTrackMetadata = (
  type: TrackType,
  setLocalTrackMetadata: SetLocalTrackMetadata<TrackMetadata>,
  metadata: TrackMetadata | null
) => {
  useEffect(() => {
    setLocalTrackMetadata(type, metadata);
  }, [type, setLocalTrackMetadata, metadata]);
};
