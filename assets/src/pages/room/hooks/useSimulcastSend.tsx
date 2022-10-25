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
  trackId?: string,
  enableTrackEncoding?: (trackId: string, encoding: TrackEncoding) => void,
  disableTrackEncoding?: (trackId: string, encoding: TrackEncoding) => void
): UseSimulcastLocalEncoding => {
  const toggleRemoteEncoding = (status: boolean, encodingName: TrackEncoding) => {
    if (!trackId) return;

    status
      ? enableTrackEncoding && enableTrackEncoding(trackId, encodingName)
      : disableTrackEncoding && disableTrackEncoding(trackId, encodingName);
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
