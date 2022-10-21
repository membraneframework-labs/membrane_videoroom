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
  const [highQuality, toggleHighQuality] = useToggle(true);
  const [mediumQuality, toggleMediumQuality] = useToggle(true);
  const [lowQuality, toggleLowQuality] = useToggle(true);

  return {
    highQuality,
    toggleHighQuality,
    mediumQuality,
    toggleMediumQuality,
    lowQuality,
    toggleLowQuality,
  };
};
