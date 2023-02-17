import React, { FC } from "react";
import clsx from "clsx";
import Pin from "../icons/Pin";
import Button from "../../shared/components/Button";

type PinUserButtonProps = {
  pinned: boolean;
  onClick: () => void;
};

export const PinTileLayer: FC<PinUserButtonProps> = ({ pinned, onClick }: PinUserButtonProps) => {
  const pinText = pinned ? "Unpin" : "Pin";

  return (
    <Button
      className={clsx(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "hidden group-hover:flex",
        "flex-row content-center",
        "opacity-50 hover:opacity-75",
        "gap-2 py-4 px-8",
        "rounded-full bg-brand-grey-100"
      )}
      onClick={onClick}
    >
      <Pin className="text-brand-white" />
      <span className={"font-lg font-aktivGrotesk font-semibold leading-6 tracking-wide text-brand-white"}>
        {pinText}
      </span>
    </Button>
  );
};

export const PinIndicator: FC = () => {
  return (
    <div className="flex h-8 w-8 flex-wrap content-center justify-center rounded-full bg-white">
      <Pin className="text-brand-dark-blue-500" />
    </div>
  );
};
