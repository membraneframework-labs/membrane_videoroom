import React from "react";
import { Modal } from "./Modal";

interface CameraPermissionModalProps {
  isOpen: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export const CameraPermissionModal: React.FC<CameraPermissionModalProps> = ({ onCancel, ...otherProps }) => {
  return (
    <Modal title="Camera not allowed" confirmText="Yes, allow camera" onRequestClose={onCancel} {...otherProps}>
      Would you like to allow this site to use camera?
    </Modal>
  );
};
