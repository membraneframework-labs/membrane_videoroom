import clsx from "clsx";
import React, { PropsWithChildren } from "react";
import BlockingScreen from "../../shared/components/BlockingScreen";
import useHorizontal from "../../shared/hooks/useHorizontal";

import Navbar from "./Navbar";
import useSmartphoneViewport from "../../shared/hooks/useMobileViewport";

const HomePageLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const isHorizontal = useHorizontal();
  const isMobile = useSmartphoneViewport();
  const shouldBlockScreen = isHorizontal && isMobile;

  return (
    <>
      {shouldBlockScreen && <BlockingScreen message="Turn your screen to join the call." />}
      <div
        className={clsx(
          "home-page h-screen w-full",
          "bg-brand-sea-blue-200 font-rocGrotesk text-brand-dark-blue-500",
          "flex flex-col items-center gap-y-4 p-4",
          "relative overflow-y-auto",
          shouldBlockScreen && "invisible"
        )}
      >
        <div className="top-4 mb-4 self-start sm:absolute sm:inset-x-4 sm:mb-0">
          <Navbar />
        </div>

        <div className="flex h-full w-full items-center justify-center">{children}</div>
      </div>
    </>
  );
};

export default HomePageLayout;
