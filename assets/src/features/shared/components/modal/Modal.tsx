import clsx from "clsx";
import React from "react";
import ReactModal from "react-modal";
import Close from "../../../room-page/icons/Close";
import Button from "../Button";

interface Props extends ReactModal.Props {
  title?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onRequestClose?: () => void;
  confirmText?: string;
  confirmClassName?: string;
  cancelText?: string;
  cancelClassName?: string;
  closable?: boolean;
  maxWidth?: string;
}

export const Modal: React.FC<Props> = (props) => {
  return (
    <ReactModal
      {...props}
      className={clsx(
        props.maxWidth ?? "max-w-sm sm:max-w-xl",
        "m-4 w-full  rounded-2xl bg-white px-6 py-8 focus:focus-visible:outline-none  sm:p-6"
      )}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div className="modal-header flex items-center justify-between">
        <div className="modal-title text-xl font-normal text-brand-dark-blue-500 sm:text-2xl">
          {props.title ?? "Modal title"}
        </div>
        <Button onClick={() => props.onRequestClose?.call(null)} className={clsx(!props.closable && "hidden")}>
          <Close className="text-xl font-normal sm:text-2xl" />
        </Button>
      </div>
      <div className="modal-body mt-2 text-base font-normal text-text-additional">
        {props.children ?? "Modal message"}
      </div>
      <div className="modal-footer mt-10 flex flex-col gap-4 sm:flex-row-reverse sm:gap-6">
        <Button
          onClick={() => props.onConfirm?.call(null)}
          variant={"normal"}
          className={clsx("flex-1", props.confirmClassName)}
        >
          {props.confirmText ?? "Confirm"}
        </Button>
        <Button
          onClick={() => props.onCancel?.call(null)}
          variant={"transparent"}
          className={clsx("flex-1", props.cancelClassName)}
        >
          {props.cancelText ?? "Cancel"}
        </Button>
      </div>
    </ReactModal>
  );
};
