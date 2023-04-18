import { useCallback, useEffect, useState } from "react";
import { MOBILE_WIDTH_BREAKPOINT, MAX_MOBILE_WIDTH_BREAKPOINT } from "../consts";

type ScreenInfo = {
  isSmartphone?: boolean;
  isHorizontal?: boolean;
};

const useSmartphoneViewport = (): ScreenInfo => {
  const [isSmartphone, setIsSmartphone] = useState<boolean | undefined>();
  const [isHorizontal, setIsHorizontal] = useState<boolean | undefined>();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateIsSmartphoneState = () => {
        if (!window.visualViewport) return;

        const isCoarse = matchMedia("(pointer:coarse)").matches;
        const hasMobileWidth = window.visualViewport.width <= MOBILE_WIDTH_BREAKPOINT;

        const isLandscapedSmartphone =
          screen.orientation.type.includes("landscape") && window.visualViewport.width <= MAX_MOBILE_WIDTH_BREAKPOINT; // iPhone 12 max  viewpor width
        setIsSmartphone(isCoarse && (hasMobileWidth || isLandscapedSmartphone));
      };

      const updateIsHorizontalOrientationState = () => {
        if (!screen) return;

        setIsHorizontal(screen.orientation.type.includes("landscape"));
      };

      const updateState = () => {
        updateIsSmartphoneState();
        updateIsHorizontalOrientationState();
      };

      updateState();
      window.addEventListener("resize", updateState);
      return () => window.removeEventListener("resize", updateState);
    }
  }, []);

  return { isSmartphone, isHorizontal };
};

export default useSmartphoneViewport;
