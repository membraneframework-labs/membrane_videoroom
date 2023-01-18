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
      className="group relative z-10 m-1 flex min-w-[52px] items-center justify-center rounded-full border-2 border-white bg-white/0 p-3 transition duration-300 ease-in-out hover:bg-white/40 disabled:pointer-events-none disabled:bg-white/50"
    >
      <img
        className={`group-disabled:invert-80 invert ${imgClasses || ""}`}
        height="26"
        width="26"
        src={icon}
        alt={hover + " button"}
      />
      <div className="invisible absolute bottom-0 mb-14 flex flex-col items-center opacity-0 transition-all duration-500 group-hover:visible group-hover:opacity-80">
        <span className="whitespace-no-wrap relative z-50 w-32 rounded-md bg-black p-2 text-xs leading-none text-white shadow-lg">
          {hover}
        </span>
        <div className="-mt-2 h-3 w-3 rotate-45 bg-black"></div>
      </div>
    </button>
  );
};

export default MediaControlButton;
