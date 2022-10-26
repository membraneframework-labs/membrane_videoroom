import { useCallback, useState } from "react";
import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";

export type UseSimulcastRemoteEncodingResult = {
  desiredEncoding: TrackEncoding;
  setDesiredEncoding: (quality: TrackEncoding) => void;
};

export const useSimulcastRemoteEncoding = (
  defaultValue: TrackEncoding = "m",
  callback?: (encoding: TrackEncoding) => void
): UseSimulcastRemoteEncodingResult => {
  const [desiredEncoding, setDesiredEncodingState] = useState<TrackEncoding>(defaultValue);

  const setDesiredEncoding = useCallback(
    (quality: TrackEncoding) => {
      // console.log({ quality });
      setDesiredEncodingState(() => quality);
      // console.log({ callback });
      // im not sure for this method
      if (callback) callback(quality);
      // todo refactor
    },
    [callback]
  );

  return {
    setDesiredEncoding: setDesiredEncoding,
    desiredEncoding: desiredEncoding,
  };
};
