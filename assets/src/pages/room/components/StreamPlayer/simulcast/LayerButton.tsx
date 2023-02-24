import { Tooltip } from "./Tooltip";
import Button from "../../../../../features/shared/components/Button";
import React from "react";
import clsx from "clsx";

export type LayerButtonProps = {
  text: string;
  tooltipText: string;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
  tooltipCss?: string;
};

export const LayerButton = ({ onClick, text, tooltipText, disabled, selected, tooltipCss = "" }: LayerButtonProps) => (
  <Tooltip text={tooltipText} textCss={tooltipCss}>
    <Button
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "mx-0.5 flex min-w-[26px] items-center justify-center rounded-full border px-2 disabled:pointer-events-none",
        {
          "bg-red-100": selected,
        }
      )}
    >
      {text}
    </Button>
  </Tooltip>
);
