import { Tooltip } from "./Tooltip";
import Button from "../../../../../features/shared/components/Button";
import React from "react";

export type LayerButtonProps = {
  text: string;
  tooltipText: string;
  onClick: () => void;
  disabled?: boolean;
};

export const LayerButton = ({ onClick, text, tooltipText, disabled }: LayerButtonProps) => (
  <Tooltip text={tooltipText} textCss="right-16">
    <Button
      disabled={disabled}
      onClick={onClick}
      className="mx-0.5 flex min-w-[26px] items-center justify-center rounded-full border disabled:pointer-events-none"
    >
      {text}
    </Button>
  </Tooltip>
);
