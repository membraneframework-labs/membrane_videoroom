import clsx from "clsx";
import React, { PropsWithChildren } from "react";
import BlockingScreen from "../../shared/components/BlockingScreen";
import useHorizontalMobile from "../../shared/hooks/useHorizontalMobile";

import Navbar from "./Navbar";

const HomePageLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const isHorizontalMobile = useHorizontalMobile();

  return (
    <>
      {isHorizontalMobile && <BlockingScreen message="Turn your screen to join the call." />}
      <div
        className={clsx(
          "home-page h-[100dvh] w-full",
          "bg-brand-sea-blue-200 font-rocGrotesk text-brand-dark-blue-500",
          "flex flex-col items-center gap-y-4 p-4",
          "relative overflow-y-auto",
          isHorizontalMobile && "invisible"
        )}
      >
        <Navbar />

        <div className="flex h-full w-full items-center justify-center">{children}</div>
      </div>
    </>
  );
};

export default HomePageLayout;
