import { useEffect } from "react";
import { TrackType } from "../pages/types";
import { SetLocalStream } from "./remove/useLoclPeerState";

export const useSetLocalUserTrack = (
  type: TrackType,
  setLocalStream: SetLocalStream,
  stream: MediaStream | null,
  isEnabled: boolean
) => {
  useEffect(() => {
    setLocalStream(type, isEnabled, stream);
  }, [type, setLocalStream, stream, isEnabled]);
};
