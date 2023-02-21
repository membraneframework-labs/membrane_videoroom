import { useEffect, useState } from "react";

const useMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean | undefined>();

  const updateIsMobileState = () => {
    if (!window.visualViewport) return;

    setIsMobile(window.visualViewport.width < 979);
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

export default useMobile;
