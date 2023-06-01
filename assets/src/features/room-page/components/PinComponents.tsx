import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Pin from "../icons/Pin";
import Button from "../../shared/components/Button";

type PinUserButtonProps = {
  pinned: boolean;
  onClick: () => void;
};

export const PinTileLayer: FC<PinUserButtonProps> = ({ pinned, onClick }: PinUserButtonProps) => {
  const pinText = pinned ? "Unpin" : "Pin";
  const [showLayer, setShowLayer] = useState<boolean>(false);
  const timeRef = useRef<NodeJS.Timeout | null>(null);

  const restartTimer = useCallback(() => {
    const hideAfterMs = 3_000;

    if (timeRef.current) {
      clearTimeout(timeRef.current);
    }

    setShowLayer(true);
    timeRef.current = setTimeout(() => {
      setShowLayer(false);
    }, hideAfterMs);
  }, []);

  useEffect(() => {
    return () => {
      if (timeRef.current) clearTimeout(timeRef.current);
    };
  }, []);

  return (
    <div className={"group absolute h-full w-full"} onMouseMove={restartTimer}>
      {showLayer && (
        <Button
          className={clsx(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "hidden group-hover:flex group-hover:duration-200",
            "flex-row content-center",
            "opacity-50 hover:opacity-75",
            "gap-2 px-8 py-4",
            "rounded-full bg-brand-grey-100"
          )}
          onClick={onClick}
        >
          <Pin className="text-brand-white" />
          <span className={"font-lg font-aktivGrotesk font-semibold leading-6 tracking-wide text-brand-white"}>
            {pinText}
          </span>
        </Button>
      )}
    </div>
  );
};

export const PinIndicator: FC = () => {
  return (
    <div className="flex h-8 w-8 flex-wrap content-center justify-center rounded-full bg-white">
      <Pin className="text-brand-dark-blue-500" />
    </div>
  );
};
