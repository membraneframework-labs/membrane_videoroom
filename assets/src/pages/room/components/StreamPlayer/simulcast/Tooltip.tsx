import React, { FC, PropsWithChildren } from "react";
import clsx from "clsx";

export type TooltipProps = PropsWithChildren & {
  text: string;
  textCss?: string;
};
export const Tooltip: FC<TooltipProps> = ({ children, text, textCss }: TooltipProps) => {
  return (
    <div className="group relative">
      {children}

      <div className="invisible absolute -bottom-12 flex w-full flex-col items-center font-aktivGrotesk opacity-0 transition-all duration-500 group-hover:visible group-hover:opacity-90">
        <div
          className={clsx(
            "h-0 w-0 rotate-180 transform",
            "border-b-0 border-l-[6px] border-r-[6px] border-t-[8px] border-solid border-brand-grey-120 border-l-transparent border-r-transparent"
          )}
        ></div>
        <span
          className={clsx(
            `whitespace-no-wrap relative z-50 min-w-max rounded-lg bg-brand-grey-120 px-4 py-3 text-sm font-normal leading-none text-white shadow-lg`,
            textCss
          )}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
