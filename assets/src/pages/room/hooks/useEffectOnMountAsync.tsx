import { useEffect, useRef } from "react";

export const useEffectOnMountAsync = (
  startOnMount: boolean,
  callback: () => { closeFunction: (() => void) | undefined }
) => {
  useEffect(() => {
    const mutableObject = callback();
    return () => {
      const abc = setInterval(() => {
        console.log("Set interval");
        if (mutableObject.closeFunction) {
          mutableObject.closeFunction();
          clearInterval(abc);
          // remove set interval
        }
      }, 3000);
    };
  }, []);
};
