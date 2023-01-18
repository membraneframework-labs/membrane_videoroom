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
        "outline-none rounded-full border p-2.5 text-xl font-bold",
        "group relative z-10 flex items-center justify-center rounded-full transition duration-300 ease-in-out disabled:pointer-events-none",
        className
      )}
    >
      {Icon && <Icon />}

      <div className="invisible absolute bottom-0 mb-12 flex flex-col items-center font-aktivGrotesk opacity-0 transition-all duration-500 group-hover:visible group-hover:opacity-90">
        <span className="whitespace-no-wrap relative z-50 min-w-max rounded-lg bg-brand-grey-120 px-4 py-3 text-sm font-normal leading-none text-white shadow-lg">
          {hover}
        </span>
        <div className="triangle-down border-brand-grey-120"></div>
      </div>
    </Button>
  );
};

export default MediaControlButton;
