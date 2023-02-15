import { useEffect, useState } from "react";

const useHorizontalMobile = () => {
  const [isHorizontalOrientation, setIsHorizontalOrientation] = useState<boolean | undefined>();

  const updateIsHorizontalOrientationState = () => {
    if (!window.visualViewport) return;

    setIsHorizontalOrientation(
      window.visualViewport.width > window.visualViewport.height && window.visualViewport.height < 400
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      updateIsHorizontalOrientationState();
      window.addEventListener("resize", updateIsHorizontalOrientationState);
      return () => window.removeEventListener("resize", updateIsHorizontalOrientationState);
    }
  }, []);

  return isHorizontalOrientation;
};

export default useHorizontalMobile;
