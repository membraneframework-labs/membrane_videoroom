import clsx from "clsx";
import React, { FC, SVGAttributes } from "react";
import Button from "../../../features/shared/components/Button";

export type MediaControlButtonProps = {
  onClick: () => void;
  hover?: string;
  buttonClassName?: string;
  hoverClassName?: string;
  hideOnMobile?: boolean;
  icon: React.FC<SVGAttributes<SVGElement>>;
  position?: "top" | "bottom";
};

const MediaControlButton: FC<MediaControlButtonProps> = ({
  hover,
  icon: Icon,
  onClick,
  hideOnMobile,
  buttonClassName,
  hoverClassName,
  position,
}: MediaControlButtonProps) => {
  const pos = position ?? "top";

  return (
    <div className={clsx("group relative", hideOnMobile && "hidden-on-mobile-device")}>
      <Button
        onClick={onClick}
        className={clsx(
          "h-[40px] w-[40px] rounded-full border px-2.5 py-[4px] text-xl font-bold",
          "z-10 flex items-center justify-center rounded-full transition duration-300 ease-in-out disabled:pointer-events-none",
          buttonClassName
        )}
      >
        {Icon && <Icon className="" />}
      </Button>

      {hover && (
        <div
          className={clsx(
            "invisible absolute bottom-0 z-50 flex w-full items-center font-aktivGrotesk opacity-0 transition-all duration-500 group-hover:visible group-hover:opacity-90",
            {
              "mb-12 flex-col": pos === "top",
              "-mb-12 flex-col-reverse": pos === "bottom",
            }
          )}
        >
          <span
            className={clsx(
              "whitespace-no-wrap relative z-50 min-w-max rounded-lg bg-brand-grey-120 px-4 py-3 text-sm font-normal leading-none text-white shadow-lg",
              hoverClassName
            )}
          >
            {hover}
          </span>
          <div
            className={clsx(
              "h-0 w-0",
              "border-b-0 border-l-[6px] border-r-[6px] border-t-[8px] border-solid border-brand-grey-120 border-l-transparent border-r-transparent",
              { "rotate-180": pos === "bottom" }
            )}
          ></div>
        </div>
      )}
    </div>
  );
};

export default MediaControlButton;
