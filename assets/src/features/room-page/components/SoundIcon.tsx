import React from "react";
import SoundBig from "../icons/SoundBig";
import clsx from "clsx";
import useDebounce from "../../shared/hooks/useDebounce";

type Props = {
  visible: boolean;
  debounce?: number;
};

// todo remove debounce
const SoundIcon = ({ visible, debounce }: Props) => {
  const isVisibleDebounced = useDebounce<boolean>(visible, debounce || 0);

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
