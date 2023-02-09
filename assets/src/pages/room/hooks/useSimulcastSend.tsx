import { useToggle } from "./useToggle";
import type { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { useSelector } from "../../../libraryUsage/setup";
import {createConnectivitySelector} from "membrane-react-webrtc-client";

export type UseSimulcastLocalEncoding = {
  highQuality: boolean;
  toggleHighQuality: () => void;
  mediumQuality: boolean;
  toggleMediumQuality: () => void;
  lowQuality: boolean;
  toggleLowQuality: () => void;
};

export const useSimulcastSend = (trackId: string | null): UseSimulcastLocalEncoding => {
  const api = useSelector(createConnectivitySelector());

  const toggleRemoteEncoding = (status: boolean, encodingName: TrackEncoding) => {
    if (!trackId) {
      throw Error("Toggling simulcast layer is not possible when trackId is null");
    }

    console.log("Sending local!")

    status ? api.api?.enableTrackEncoding(trackId, encodingName) : api.api?.disableTrackEncoding(trackId, encodingName);
  };

  const [highQuality, toggleHighQuality] = useToggle(true, (encoding) => {
    toggleRemoteEncoding(encoding, "h");
  });
  const [mediumQuality, toggleMediumQuality] = useToggle(true, (encoding) => {
    toggleRemoteEncoding(encoding, "m");
  });
  const [lowQuality, toggleLowQuality] = useToggle(true, (encoding) => {
    toggleRemoteEncoding(encoding, "l");
  });

  return {
    highQuality,
    toggleHighQuality,
    mediumQuality,
    toggleMediumQuality,
    lowQuality,
    toggleLowQuality,
  };
};
