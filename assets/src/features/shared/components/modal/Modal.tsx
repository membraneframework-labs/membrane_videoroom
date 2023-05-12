import clsx from "clsx";
import React from "react";
import ReactModal from "react-modal";
import Close from "../../../room-page/icons/Close";
import Button from "../Button";

interface ModalProps extends ReactModal.Props {
  title: string;
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

export const Modal: React.FC<ModalProps> = ({
  maxWidth,
  title,
  onRequestClose,
  closable,
  children,
  onConfirm,
  confirmClassName,
  confirmText,
  onCancel,
  cancelClassName,
  cancelText,
  ...otherProps
}) => {
  return (
    <ReactModal
      className={clsx(
        maxWidth ?? "max-w-sm sm:max-w-xl",
        "m-4 w-full rounded-2xl bg-white px-6 py-8 focus:focus-visible:outline-none sm:p-6"
      )}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      {...otherProps}
    >
      <div className="modal-header flex items-center justify-between">
        <div className="modal-title font-rocGrotesk text-xl font-medium text-brand-dark-blue-500 sm:text-2xl">
          {title}
        </div>
        <Button onClick={() => onRequestClose?.()} removeDefaultPadding className={clsx(!closable && "hidden")}>
          <Close className="text-xl font-normal sm:text-2xl" width="32" height="32" />
        </Button>
      </div>
      <div className="modal-body mt-2 text-base font-normal text-text-additional">{children ?? "Modal message"}</div>
      <div className="modal-footer mt-10 flex flex-col gap-4 sm:flex-row-reverse sm:gap-6">
        <Button onClick={() => onConfirm?.()} variant={"normal"} className={clsx("flex-1", confirmClassName)}>
          {confirmText ?? "Confirm"}
        </Button>
        <Button onClick={() => onCancel?.()} variant={"transparent"} className={clsx("flex-1", cancelClassName)}>
          {cancelText ?? "Cancel"}
        </Button>
      </div>
    </ReactModal>
  );
};
