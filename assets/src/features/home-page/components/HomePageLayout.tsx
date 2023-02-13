import clsx from "clsx";
import React, { PropsWithChildren } from "react";

import Navbar from "./Navbar";

const HomePageLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className={clsx(
        "home-page h-screen w-full bg-brand-sea-blue-200 text-brand-dark-blue-500",
        "font-rocGrotesk",
        "flex flex-col items-center gap-y-4 p-4",
        "relative"
      )}
    >
      <Navbar />

      <div className="flex h-full w-full justify-center py-4 sm:py-8 2xl:py-12">{children}</div>
    </div>
  );
};

export default HomePageLayout;
