import React from "react";
import RotateRight from "../../room-page/icons/RotateRight";

const BlockingScreen: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div
      className="absolute inset-0 z-30 flex h-full w-full flex-col items-center justify-center gap-y-4 bg-brand-sea-blue-100 font-aktivGrotesk text-brand-dark-blue-500"
      style={{
        backgroundImage: "url('/images/videoroomBackground.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center",
      }}
    >
      <RotateRight className="text-2xl text-brand-dark-blue-500" />
      <div className="font-rocGrotesk text-4xl font-medium">Ooops!</div>
      <div className="text-xl">{message}</div>
    </div>
  );
};

export default BlockingScreen;
