import { useEffect, useState } from "react";
import { MOBILE_WIDTH_BREAKPOINT } from "../consts";

const useSmartphoneViewport = () => {
  const [isSmartphone, setIsSmartphone] = useState<boolean | undefined>();

  const updateIsSmartphoneState = () => {
    if (!window.visualViewport) return;

    const isCoarse = matchMedia('(pointer:coarse)').matches;
    const hasMobileWidth = window.visualViewport.width <= MOBILE_WIDTH_BREAKPOINT;
    
    const isLandscapedSmartphone = screen.orientation.type.includes("landscape") && window.visualViewport.width <= 926; // iPhone 12 max  viewpor width
    setIsSmartphone(isCoarse && (hasMobileWidth || isLandscapedSmartphone));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      updateIsSmartphoneState();
      window.addEventListener("resize", updateIsSmartphoneState);
      return () => window.removeEventListener("resize", updateIsSmartphoneState);
    }
  }, []);

  return isSmartphone;
};

export default useSmartphoneViewport;
