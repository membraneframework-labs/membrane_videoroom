import React from "react";
import Button from "../../shared/components/Button";
import noop from "../../shared/utils/noop";
import clsx from "clsx";
import Send from "../icons/Send";

type SubmitButtonProps = {
  isSmartphone: boolean;
  disabled: boolean;
};

const SubmitButton = ({ isSmartphone, disabled }: SubmitButtonProps) => {
  const smartphoneWrapperStyle = clsx(
    "fixed bottom-0 left-0 right-0",
    "h-36 w-full bg-brand-white",
    "flex flex-col items-center gap-4",
    "px-8 pt-6"
  );
  const desktopWrapperStyle = "flex flex-col content-center gap-4";

  return (
    <div aria-label="questionnaire-submit" className={isSmartphone ? smartphoneWrapperStyle : desktopWrapperStyle}>
      <Button
        type="submit"
        onClick={noop}
        variant="normal"
        className={clsx("align-center flex flex-wrap justify-center gap-2 px-8", isSmartphone && "w-full")}
        disabled={disabled}
      >
        Submit <Send />
      </Button>
      <span className="font-aktivGrotesk text-xs text-text-additional">
        You need to rate at least one quality to submit
      </span>
    </div>
  );
};

export default SubmitButton;
