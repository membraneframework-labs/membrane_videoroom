import React from "react";
import Navbar from "../../home-page/components/Navbar";
import BinocularsIcon from "../icons/BinocularsIcon";
import BackgroundRight from "./BackgroundRight";
import Button from "./Button";

const Page404: React.FC = () => {
  return (
    <div className="h-screen w-full bg-brand-sea-blue-100 text-brand-dark-blue-500">
      <div className="absolute hidden h-full w-full overflow-clip sm:block">
        <BackgroundRight className="absolute top-1/20 left-0 h-9/10 -translate-x-1/2" opacity={0.3} />
        <BackgroundRight className="absolute top-1/20 right-0 h-9/10 translate-x-1/2" opacity={0.1} />
      </div>

      <div className="absolute inset-x-4 top-4 mb-4 self-start">
        <Navbar />
      </div>

      <div
        className={
          "absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-y-10 font-aktivGrotesk"
        }
      >
        <BinocularsIcon />

        <div className="flex flex-col gap-y-4 text-center">
          <div className="font-rocGrotesk text-5xl font-medium">404 — Page not found</div>
          <div className="text-xl">Ooops! This page does not exist.</div>
        </div>

        <Button href="/" variant="normal">
          Go to Main page
        </Button>
      </div>
    </div>
  );
};

export default Page404;