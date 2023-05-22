import React from "react";
import SoundBig from "../icons/SoundBig";
import clsx from "clsx";
import useDebounce from "../../shared/hooks/useDebounce";

type Props = {
  visible: boolean;
};

const SoundIcon = ({ visible }: Props) => {
  const debounceDelay = 200;
  const isVisibleDebounced = useDebounce<boolean>(visible, debounceDelay);

  return (
    <div
      className={clsx(
        "flex h-8 w-8 flex-wrap content-center justify-center",
        "rounded-full bg-white",
        "transition-opacity duration-75",
        !isVisibleDebounced && "opacity-0"
      )}
    >
      <SoundBig className="text-brand-dark-blue-500" />
    </div>
  );
};

export default SoundIcon;
