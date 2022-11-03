import { useEffect } from "react";
import { PeersApi } from "./usePeerState";
import { TrackType } from "../../types";

export const useSetLocalUserTrack = (type: TrackType, stream?: MediaStream, api?: PeersApi) => {
  useEffect(() => {
    if (!api) return;
    // console.log({name: "useSetLocalUserTrack", stream});

    api.setLocalStream(type, stream);
  }, [type, api, stream]);
};
