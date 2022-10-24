import { useToggle } from "./useToggle";

export type UseSimulcastLocalEncoding = {
  highQuality: boolean;
  toggleHighQuality: () => void;
  mediumQuality: boolean;
  toggleMediumQuality: () => void;
  lowQuality: boolean;
  toggleLowQuality: () => void;
};

export const useSimulcastSend = (): UseSimulcastLocalEncoding => {
  const [highQuality, toggleHighQuality] = useToggle(false);
  const [mediumQuality, toggleMediumQuality] = useToggle(false);
  const [lowQuality, toggleLowQuality] = useToggle(false);

  return {
    highQuality,
    toggleHighQuality,
    mediumQuality,
    toggleMediumQuality,
    lowQuality,
    toggleLowQuality,
  };
};
