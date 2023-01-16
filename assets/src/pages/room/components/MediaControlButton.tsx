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

      <div className="transition-all duration-500 absolute bottom-0 flex flex-col opacity-0 items-center invisible mb-14 group-hover:visible group-hover:opacity-80 font-aktivGrotesk">
        <span className="relative z-50 min-w-max px-2 py-3 text-sm font-normal leading-none rounded-lg text-white whitespace-no-wrap bg-brand-grey-120 shadow-lg">
          {hover}
        </span>
        <div className="w-3 h-3 -mt-2 rotate-45 bg-brand-grey-120"></div>
      </div>
    </Button>
  );
};

export default MediaControlButton;
