import React from "react";
import Button from "../../shared/components/Button";
import noop from "../../shared/utils/noop";
import clsx from "clsx";
import Send from "../icons/Send";

type SubmitButtonProps = {
  disabled: boolean;
  fullWidth?: boolean;
};

const SubmitButton = ({ fullWidth, disabled }: SubmitButtonProps) => (
  <Button
    type="submit"
    onClick={noop}
    variant="normal"
    className={clsx("align-center flex flex-wrap justify-center gap-2 px-8", fullWidth && "w-full")}
    disabled={disabled}
  >
    Submit <Send />
  </Button>
);

export default SubmitButton;
