import clsx from "clsx";
import React from "react";
import Close from "../../room-page/icons/Close";
import { ToastType } from "../context/ToastContext";
import Button from "./Button";

type ToastProps = ToastType & { onClose: () => void };

const Toast: React.FC<ToastProps> = ({ id, message, onClose, type = "information" }) => {
  return (
    <div
      id={id}
      className={clsx(
        "font-aktivGrotesk text-sm text-brand-white",
        type == "error" ? "bg-red-700" : "bg-brand-dark-blue-500",
        "rounded-full px-6 py-4",
        "flex gap-x-3 sm:whitespace-nowrap",
        "fromTop"
      )}
    >
      <div className="min-w-[15rem] text-center sm:min-w-fit">{message}</div>
      <Button onClick={onClose} removeDefaultPadding>
        <Close className="text-lg font-medium" />
      </Button>
    </div>
  );
};

export default Toast;
