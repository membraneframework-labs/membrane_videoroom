import clsx from "clsx";
import React, { FC, SVGAttributes } from "react";
import Button from "../../../features/shared/components/Button";

export type MediaControlButtonProps = {
  onClick: () => void;
  hover?: string;
  className?: string;
  hideOnMobile?: boolean;
  icon: React.FC<SVGAttributes<SVGElement>>;
};

const MediaControlButton: FC<MediaControlButtonProps> = ({
  hover,
  icon: Icon,
  onClick,
  hideOnMobile,
  className,
}: MediaControlButtonProps) => {
  return (
    <div className={clsx("group relative", hideOnMobile && "hidden-on-mobile-and-tablet")}>
      <Button
        onClick={onClick}
        className={clsx(
          "rounded-full border p-2.5 text-xl font-bold",
          "z-10 flex items-center justify-center rounded-full transition duration-300 ease-in-out disabled:pointer-events-none",
          className
        )}
      >
        {Icon && <Icon />}
      </Button>

      {hover && (
        <div className="invisible absolute bottom-0 mb-12 flex w-full flex-col items-center font-aktivGrotesk opacity-0 transition-all duration-500 group-hover:visible group-hover:opacity-90">
          <span className="whitespace-no-wrap relative z-50 min-w-max rounded-lg bg-brand-grey-120 px-4 py-3 text-sm font-normal leading-none text-white shadow-lg">
            {hover}
          </span>
          <div
            className={clsx(
              "h-0 w-0",
              "border-b-0 border-l-[6px] border-r-[6px] border-t-[8px] border-solid border-brand-grey-120 border-l-transparent border-r-transparent"
            )}
          ></div>
        </div>
      )}
    </div>
  );
};

export default MediaControlButton;
