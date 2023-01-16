import clsx from "clsx";
import React, { PropsWithChildren } from "react";
import Navbar from "./Navbar";

const PageLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className={clsx(
        "h-screen w-full",
        "bg-brand-sea-blue-100 text-brand-dark-blue-500 font-rocGrotesk",
        "flex flex-col items-center p-4 gap-y-4"
      )}
      style={{
        backgroundImage: "url('/images/videoroomBackground.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "auto",
        backgroundPosition: "center",
      }}
    >
      {/* navbar */}
      <Navbar />

      {/* content */}
      <div className="w-full h-full">{children}</div>
    </div>
  );
};

export default PageLayout;
