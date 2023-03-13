import clsx from "clsx";
import React, { PropsWithChildren } from "react";
import BlockingScreen from "../../shared/components/BlockingScreen";
import useHorizontalMobile from "../../shared/hooks/useHorizontalMobile";
import Navbar from "./Navbar";

const PageLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const isHorizontalMobile = useHorizontalMobile();
  return (
    <>
      {isHorizontalMobile ? (
        <BlockingScreen message="Turn your screen to resume the call." />
      ) : (
        <div
          className={clsx(
            "h-[100dvh] w-full bg-auto bg-center bg-no-repeat sm:bg-videoroom-background",
            "bg-brand-sea-blue-100 font-rocGrotesk text-brand-dark-blue-500",
            "flex flex-col items-center gap-y-4 p-4",
            isHorizontalMobile && "invisible"
          )}
        >
          <Navbar />

          <div className="h-full w-full">{children}</div>
        </div>
      )}
    </>
  );
};

export default PageLayout;
