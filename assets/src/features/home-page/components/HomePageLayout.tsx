import clsx from "clsx";
import React, { PropsWithChildren } from "react";

import Navbar from "./Navbar";

const HomePageLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className={clsx(
        "h-screen w-full bg-brand-sea-blue-200 text-brand-dark-blue-500",
        "font-rocGrotesk",
        "flex flex-col items-center p-4",
        "relative"
      )}
      style={{
        backgroundImage: "url('/images/backgroundLeft.png'), url('/images/backgroundRight.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "left -90px top 200px, right -170px top 120px",
      }}
    >
      <Navbar />

      <div className="flex h-full w-full items-center justify-center">{children}</div>
    </div>
  );
};

export default HomePageLayout;
