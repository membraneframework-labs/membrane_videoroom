import { useCallback, useState } from "react";

export type SimulcastQuality = "l" | "m" | "h";

export type UseSimulcastRemoteEncodingResult = {
  quality: SimulcastQuality;
  setQuality: (quality: SimulcastQuality) => void;
};

export const useSimulcastRemoteEncoding = (): UseSimulcastRemoteEncodingResult => {
  const [state, setState] = useState<SimulcastQuality>("m");

  const setQuality = useCallback((quality: SimulcastQuality) => {
    console.log({ quality });
    setState(() => quality);
  }, []);

  return {
    setQuality,
    quality: state,
  };
};
