import React from "react";
import { Modal } from "./Modal";

interface Props {
  isOpen: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export const CameraPermissionModal: React.FC<Props> = ({ ...props }) => {
  return (
    <Modal title="Camera not allowed" confirmText="Yes, allow camera" onRequestClose={props.onCancel} {...props}>
      Would you like to allow this site to use camera?
    </Modal>
  );
};
