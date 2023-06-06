import clsx from "clsx";
import React, { PropsWithChildren } from "react";
import BlockingScreen from "../../shared/components/BlockingScreen";

import Navbar from "./Navbar";
import useSmartphoneViewport from "../../shared/hooks/useSmartphoneViewport";
import useDynamicHeightResize from "../../shared/hooks/useDynamicHeightResize";

const QuestionnairePageLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const { isSmartphone, isHorizontal } = useSmartphoneViewport();
  const shouldBlockScreen = isSmartphone && isHorizontal;

  useDynamicHeightResize();
  return (
    <>
      {shouldBlockScreen && <BlockingScreen message="Turn your screen to join the call." />}
      <div
        className={clsx(
          "home-page h-inner-height w-full",
          "bg-brand-sea-blue-200 font-rocGrotesk text-brand-dark-blue-500",
          "flex flex-col items-center gap-y-12 p-4 sm:gap-y-4",
          "relative overflow-y-auto",
          shouldBlockScreen && "invisible",
          isSmartphone && "no-scrollbar"
        )}
      >
        <Navbar />

        <div className="m-auto flex w-full items-center justify-center">{children}</div>
      </div>
    </>
  );
};

export default QuestionnairePageLayout;
