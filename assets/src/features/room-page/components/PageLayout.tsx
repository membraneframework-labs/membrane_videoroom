import clsx from "clsx";
import React, { PropsWithChildren } from "react";
import Navbar from "./Navbar";

const PageLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className={clsx(
        "h-screen w-full",
        "bg-brand-sea-blue-100 font-rocGrotesk text-brand-dark-blue-500",
        "flex flex-col items-center gap-y-4 p-4"
      )}
      style={{
        backgroundImage: "url('/images/videoroomBackground.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "auto",
        backgroundPosition: "center",
      }}
    >
      <Navbar />

      <div className="h-full w-full">{children}</div>
    </div>
  );
};

export default PageLayout;
