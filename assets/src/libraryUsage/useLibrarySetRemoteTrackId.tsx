import { useEffect } from "react";
import { TrackType } from "../pages/types";
import { SetLocalTrackId } from "./remove/useLoclPeerState";

export const useSetRemoteTrackId = (type: TrackType, setLocalTrackId: SetLocalTrackId, trackId: string | null) => {
  useEffect(() => {
    setLocalTrackId(type, trackId);
  }, [type, setLocalTrackId, trackId]);
};
