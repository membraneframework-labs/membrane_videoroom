import { useEffect, useState } from "react";
import { MOBILE_BREAKPOINT } from "../consts";

const useMobileViewport = () => {
  const [isMobile, setIsMobile] = useState<boolean | undefined>();

  const updateIsMobileState = () => {
    if (!window.visualViewport) return;
    setIsMobile(window.visualViewport.width < MOBILE_BREAKPOINT);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      updateIsMobileState();
      window.addEventListener("resize", updateIsMobileState);
      return () => window.removeEventListener("resize", updateIsMobileState);
    }
  }, []);

  return isMobile;
};

export default useMobileViewport;
