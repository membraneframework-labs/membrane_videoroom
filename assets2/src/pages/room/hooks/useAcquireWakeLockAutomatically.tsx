import { usePageVisibility } from "react-page-visibility";
import { useEffect } from "react";

export const useAcquireWakeLockAutomatically = () => {
  // https://caniuse.com/mdn-api_wakelock
  const isSupported = typeof window !== "undefined" && "wakeLock" in navigator;
  const isVisible = usePageVisibility();

  useEffect(() => {
    if (!isSupported) return;

    if (isVisible) {
      const request = navigator.wakeLock.request("screen");

      return () => {
        request.then((wakeLockSentinel) => wakeLockSentinel.release());
      };
    }
  }, [isSupported, isVisible]);
};
