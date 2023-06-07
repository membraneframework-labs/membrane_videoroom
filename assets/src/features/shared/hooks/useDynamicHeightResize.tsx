import { useCallback, useEffect } from "react";

// Inspired by: https://pqina.nl/blog/how-to-prevent-scrolling-the-page-on-ios-safari/

// TODO when `dvh` will be more common please delete this module.
// As a day of writing this comment, about 8 % of all mobile users use a version of Safari that do not support `dvh`.
// When the amount will be significantly smaller, this module can be evaporated.
// Reference: https://caniuse.com/?search=dvh

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
