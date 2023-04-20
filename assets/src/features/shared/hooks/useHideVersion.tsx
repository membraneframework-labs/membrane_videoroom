import React, { useEffect } from "react"


const useHideVersion = () => {
    const versionElementId = "videoroom-version";

    useEffect(() => {
        const versionsElement = document.getElementById(versionElementId);
        if (versionsElement) {
            versionsElement.classList.remove("visible");
            versionsElement.classList.add("hidden");
        }
        return () => versionsElement?.classList.remove("hidden");
    }, []);
}

export default useHideVersion;