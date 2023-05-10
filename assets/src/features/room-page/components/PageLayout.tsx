import clsx from "clsx";
import React, { PropsWithChildren } from "react";
import BlockingScreen from "../../shared/components/BlockingScreen";
import Navbar from "./Navbar";
import useSmartphoneViewport from "../../shared/hooks/useSmartphoneViewport";

const PageLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const { isSmartphone, isHorizontal } = useSmartphoneViewport();

  const shouldBlockScreen = isSmartphone && isHorizontal;
  return (
    <>
      {shouldBlockScreen && <BlockingScreen message="Turn your screen to resume the call." />}
      <div
        className={clsx(
          "h-screen w-full bg-auto bg-center bg-no-repeat sm:bg-videoroom-background",
          "bg-brand-sea-blue-100 font-rocGrotesk text-brand-dark-blue-500",
          "flex flex-col items-center gap-y-4 overflow-x-hidden p-4",
          shouldBlockScreen && "invisible"
        )}
      >
        <Navbar />

        <div className="h-full w-full">{children}</div>
      </div>
    </>
  );
};

export default PageLayout;
