import { useCallback, useEffect } from "react";

const useDynamicHeightResize = () => {
  const changeCssHeightVariable = useCallback(() => {
    window.document.documentElement.style.setProperty("--window-inner-height", `${window.innerHeight}px`);
  }, []);

  useEffect(() => {
    changeCssHeightVariable();
    window.addEventListener("resize", changeCssHeightVariable);

    return () => {
      window.removeEventListener("resize", changeCssHeightVariable);
    };
  }, [changeCssHeightVariable]);
};

export default useDynamicHeightResize;
