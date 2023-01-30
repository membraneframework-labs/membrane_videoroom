import clsx from "clsx";
import React from "react";
import Close from "../../room-page/icons/Close";
import { ToastType } from "../context/ToastContext";
import Button from "./Button";

type ToastProps = ToastType & { onClose: () => void };

const Toast: React.FC<ToastProps> = ({ id, message, onClose }) => {
  return (
    <div
      id={id}
      className={clsx(
        "bg-brand-dark-blue-500 font-aktivGrotesk text-sm text-brand-white",
        "rounded-full px-6 py-4",
        "flex gap-x-3 whitespace-nowrap",
        "fromTop"
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
