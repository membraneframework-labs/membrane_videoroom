import React, { FC } from "react";

export type MediaControlButtonProps = {
  onClick: () => void;
  icon: string;
  hover: string;
  imgClasses?: string;
};

const MediaControlButton: FC<MediaControlButtonProps> = ({
  hover,
  icon,
  onClick,
  imgClasses,
}: MediaControlButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="group min-w-[52px] relative flex justify-center items-center z-10 m-1 p-3 rounded-full transition duration-300 ease-in-out border-2 border-white bg-white/0 hover:bg-white/40 disabled:bg-white/50 disabled:pointer-events-none"
    >
      <img
        className={`invert group-disabled:invert-80 ${imgClasses || ""}`}
        height="26"
        width="26"
        src={icon}
        alt={hover + " button"}
      />
      <div className="transition-all duration-500 absolute bottom-0 flex flex-col opacity-0 items-center invisible mb-14 group-hover:visible group-hover:opacity-80">
        <span className="relative z-50 w-32 p-2 text-xs leading-none rounded-md text-white whitespace-no-wrap bg-black shadow-lg">
          {hover}
        </span>
        <div className="w-3 h-3 -mt-2 rotate-45 bg-black"></div>
      </div>
    </button>
  );
};

export default MediaControlButton;
