import { useToggle } from "./useToggle";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { useApi, useCurrentUserVideoTrackId } from "../../../jellifish.types";

export type UseSimulcastLocalEncoding = {
  highQuality: boolean;
  toggleHighQuality: () => void;
  mediumQuality: boolean;
  toggleMediumQuality: () => void;
  lowQuality: boolean;
  toggleLowQuality: () => void;
};

export const useSimulcastSend = (): UseSimulcastLocalEncoding => {
  const api = useApi();
  const trackId = useCurrentUserVideoTrackId();

  const toggleRemoteEncoding = (status: boolean, encodingName: TrackEncoding) => {
    if (!trackId) {
      throw Error("Toggling simulcast layer is not possible when trackId is null");
    }

    // console.log(trackId);
    status ? api?.enableTrackEncoding(trackId, encodingName) : api?.disableTrackEncoding(trackId, encodingName);
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
