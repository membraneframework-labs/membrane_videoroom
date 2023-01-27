import clsx from "clsx";
import React from "react";
import Close from "../../room-page/icons/Close";
import { ToastType } from "../context/ToastContext";
import Button from "./Button";

type ToastProps = ToastType & { onClose: () => void };

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  return (
    <div
      className={clsx(
        "bg-brand-dark-blue-500 font-aktivGrotesk text-sm text-brand-white",
        "rounded-full px-6 py-4",
        "flex gap-x-3 whitespace-nowrap"
      )}
    >
      {message}
      <Button onClick={onClose}>
        <Close className="text-lg font-medium" />
      </Button>
    </div>
  );
};

export default Toast;
