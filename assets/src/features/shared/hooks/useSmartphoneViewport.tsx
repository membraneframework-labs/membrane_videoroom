import { useCallback, useEffect, useState } from "react";
import { MOBILE_WIDTH_BREAKPOINT, MAX_MOBILE_WIDTH_BREAKPOINT } from "../consts";

type ScreenInfo = {
  isSmartphone?: boolean;
  isHorizontal?: boolean;
};

const useSmartphoneViewport = (): ScreenInfo => {
  const [isSmartphone, setIsSmartphone] = useState<boolean | undefined>();
  const [isHorizontal, setIsHorizontal] = useState<boolean | undefined>();

  const isLandscape = useCallback(() => {
    if (typeof window === "undefined") return;

    return screen.orientation?.type.includes("landscape") || window.matchMedia("(orientation: landscape)").matches;
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // The screen.orientation.type is widely available on most of the devices but it was recently added to mobile safari.
      // Source: https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation
      // At the day of writing this comment (May 8th 2023) some web apps like Chrome on iOS does NOT implement this.
      // The `windows.matchMedia` is used as a fallback for such devices.

      const updateIsSmartphoneState = () => {
        if (!window.visualViewport) return;

        const isCoarse = matchMedia("(pointer:coarse)").matches;
        const hasMobileWidth = window.visualViewport.width <= MOBILE_WIDTH_BREAKPOINT;

        const isLandscapedSmartphone = isLandscape() && window.visualViewport.width <= MAX_MOBILE_WIDTH_BREAKPOINT; // iPhone 12 max  viewpor width
        setIsSmartphone(isCoarse && (hasMobileWidth || isLandscapedSmartphone));
      };

      const updateIsHorizontalOrientationState = () => {
        if (!screen) return;

        setIsHorizontal(isLandscape());
      };

      const updateState = () => {
        updateIsSmartphoneState();
        updateIsHorizontalOrientationState();
      };

      updateState();
      window.addEventListener("resize", updateState);
      if (screen.orientation) screen.orientation.addEventListener("change", updateState); //Safari does NOT consider orientation change to be a resize so this event listener is needed.
      return () => {
        window.removeEventListener("resize", updateState);
        if (screen.orientation) screen.orientation.removeEventListener("change", updateState);
      };
    }
  }, [isLandscape]);

  return { isSmartphone, isHorizontal };
};

export default useSmartphoneViewport;
