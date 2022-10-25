import { useCallbackToggle, useToggle } from "./useToggle";
import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";

export type UseSimulcastLocalEncoding = {
  highQuality: boolean;
  toggleHighQuality: () => void;
  mediumQuality: boolean;
  toggleMediumQuality: () => void;
  lowQuality: boolean;
  toggleLowQuality: () => void;
};

export const useSimulcastSend = (
  enableTrackEncoding?: (encoding: TrackEncoding) => void,
  disableTrackEncoding?: (encoding: TrackEncoding) => void
): UseSimulcastLocalEncoding => {
  const toggleRemoteEncoding = (status: boolean, encodingName: TrackEncoding) => {
    status
      ? enableTrackEncoding && enableTrackEncoding(encodingName)
      : disableTrackEncoding && disableTrackEncoding(encodingName);
  };

  const [highQuality, toggleHighQuality] = useCallbackToggle(true, (encoding) => {
    toggleRemoteEncoding(encoding, "h");
  });
  const [mediumQuality, toggleMediumQuality] = useCallbackToggle(true, (encoding) => {
    toggleRemoteEncoding(encoding, "m");
  });
  const [lowQuality, toggleLowQuality] = useCallbackToggle(true, (encoding) => {
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
