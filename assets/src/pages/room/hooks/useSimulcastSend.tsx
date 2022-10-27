import { useCallbackToggle } from "./useToggle";
import { MembraneWebRTC, TrackEncoding } from "@membraneframework/membrane-webrtc-js";

export type UseSimulcastLocalEncoding = {
  highQuality: boolean;
  toggleHighQuality: () => void;
  mediumQuality: boolean;
  toggleMediumQuality: () => void;
  lowQuality: boolean;
  toggleLowQuality: () => void;
};

export const useSimulcastSend = (trackId?: string, webrtc?: MembraneWebRTC): UseSimulcastLocalEncoding => {
  const toggleRemoteEncoding = (status: boolean, encodingName: TrackEncoding) => {
    if (!trackId) return;

    console.log({ trackId });

    status ? webrtc?.enableTrackEncoding(trackId, encodingName) : webrtc?.disableTrackEncoding(trackId, encodingName);
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
