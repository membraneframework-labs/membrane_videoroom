import { useToggle } from "./useToggle";
import { MembraneWebRTC, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";

export type UseSimulcastLocalEncoding = {
  highQuality: boolean;
  toggleHighQuality: () => void;
  mediumQuality: boolean;
  toggleMediumQuality: () => void;
  lowQuality: boolean;
  toggleLowQuality: () => void;
};

export const useSimulcastSend = (trackId: string | null, webrtc: MembraneWebRTC | null): UseSimulcastLocalEncoding => {
  const toggleRemoteEncoding = (status: boolean, encodingName: TrackEncoding) => {
    if (!trackId) {
      throw Error("Toggling simulcast layer is not possible when trackId is null");
    }

    status ? webrtc?.enableTrackEncoding(trackId, encodingName) : webrtc?.disableTrackEncoding(trackId, encodingName);
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
