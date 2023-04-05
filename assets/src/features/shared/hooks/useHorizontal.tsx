import { useEffect, useState } from "react";

const useHorizontal = () => {
  const [isHorizontalOrientation, setIsHorizontalOrientation] = useState<boolean | undefined>();

  const updateIsHorizontalOrientationState = () => {
    if ( !screen ) return;

    setIsHorizontalOrientation(screen.orientation.type.includes("landscape"));
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

export default useHorizontal;
