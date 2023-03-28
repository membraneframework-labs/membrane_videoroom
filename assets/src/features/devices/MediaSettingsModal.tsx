import React, { useEffect, useState } from "react";
import { DeviceSelector } from "./DeviceSelector";
import { useModal } from "../../contexts/ModalContext";
import { useLocalPeer } from "./LocalPeerContext";
import { Modal } from "../shared/components/modal/Modal";

export const MediaSettingsModal: React.FC = () => {
  const { setOpen, isOpen } = useModal();
  const { setVideoDeviceId, videoDeviceId, setAudioDeviceId, audioDeviceId, videoDevices, audioDevices } =
    useLocalPeer();
  const [videoInput, setVideoInput] = useState<string | null>(null);
  const [audioInput, setAudioInput] = useState<string | null>(null);

  useEffect(() => {
    if (videoDevices && videoDeviceId) {
      setVideoInput(videoDeviceId);
    }
  }, [videoDevices, videoDeviceId]);

  useEffect(() => {
    if (audioDevices && audioDeviceId) {
      setAudioInput(audioDeviceId);
    }
  }, [audioDevices, audioDeviceId]);

  const handleClose = () => {
    setOpen(false);
    setAudioInput(audioDeviceId);
    setVideoInput(videoDeviceId);
  };

  return (
    <Modal
      title="Settings"
      confirmText="Save"
      onRequestClose={handleClose}
      closable
      cancelClassName="text-additional-red-100"
      onConfirm={() => {
        setAudioDeviceId(audioInput);
        setVideoDeviceId(videoInput);
        setOpen(false);
      }}
      onCancel={handleClose}
      maxWidth="max-w-md"
      isOpen={isOpen}
    >
      <DeviceSelector name="Select camera" devices={videoDevices} setInput={setVideoInput} inputValue={videoInput} />
      <DeviceSelector
        name="Select microphone"
        devices={audioDevices}
        setInput={setAudioInput}
        inputValue={audioInput}
      />
    </Modal>
  );
};
