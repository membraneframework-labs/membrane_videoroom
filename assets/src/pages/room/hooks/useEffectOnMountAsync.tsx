import { EffectCallback, useEffect, useRef } from "react";

export const useEffectOnMountAsync = (startOnMount: boolean, callback: EffectCallback) => {
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (!startOnMount) {
      return;
    }
    if (!isLoadingRef.current) {
      return callback();
    }
  }, []);
};
