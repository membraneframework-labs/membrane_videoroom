import { useEffect } from "react";

const useHideVersion = () => {
  const versionElementId = "videoroom-version";

  useEffect(() => {
    const versionsElement = document.getElementById(versionElementId);
    versionsElement?.classList?.add("hidden");

    return () => versionsElement?.classList?.remove("hidden");
  }, []);
};

export default useHideVersion;
