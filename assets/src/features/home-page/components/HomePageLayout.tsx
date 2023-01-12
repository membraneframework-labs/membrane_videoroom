import clsx from "clsx";
import React, { PropsWithChildren } from "react";
import MembraneLogo from "../../shared/components/MembraneLogo";
import PlainLink from "../../shared/components/PlainLink";

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
      {/* navbar */}
      <PlainLink href="/" name="home-page" className="self-start">
        <MembraneLogo className="text-5xl" />
      </PlainLink>

      {/* content */}
      <div className="flex items-center justify-center w-full h-full">{children}</div>
    </div>
  );
};

export default HomePageLayout;
