import clsx from "clsx";
import React, { FC, SVGAttributes } from "react";
import Button from "../../../features/shared/components/Button";

export type MediaControlButtonProps = {
  onClick: () => void;
  hover: string;
  className?: string;
  icon: React.FC<SVGAttributes<SVGElement>>;
};

const MediaControlButton: FC<MediaControlButtonProps> = ({
  hover,
  icon: Icon,
  onClick,
  className,
}: MediaControlButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={clsx(
        "p-2.5 border outline-none rounded-full font-bold text-xl",
        "group relative flex justify-center items-center z-10 rounded-full transition duration-300 ease-in-out disabled:pointer-events-none",
        className
      )}
    >
      {Icon && <Icon />}

      <div className="transition-all duration-500 absolute bottom-0 flex flex-col opacity-0 items-center invisible mb-12 group-hover:visible group-hover:opacity-90 font-aktivGrotesk">
        <span className="relative z-50 min-w-max px-4 py-3 text-sm font-normal leading-none rounded-lg text-white whitespace-no-wrap bg-brand-grey-120 shadow-lg">
          {hover}
        </span>
        <div
          className={clsx(
            "w-0 h-0",
            "border-solid border-b-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-brand-grey-120"
          )}
        ></div>
      </div>
    </Button>
  );
};

export default MediaControlButton;
