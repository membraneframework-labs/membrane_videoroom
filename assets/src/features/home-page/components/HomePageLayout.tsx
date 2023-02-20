import clsx from "clsx";
import React, { PropsWithChildren } from "react";

import Navbar from "./Navbar";

const HomePageLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className={clsx(
        "home-page h-[100dvh] w-full bg-brand-sea-blue-200 text-brand-dark-blue-500",
        "font-rocGrotesk",
        "flex flex-col items-center gap-y-4 p-4",
        "relative overflow-y-auto"
      )}
    >
      <div className="absolute inset-x-4 top-4">
        <Navbar />
      </div>

      <div className="flex h-full w-full justify-center">{children}</div>
    </div>
  );
};

export default HomePageLayout;
