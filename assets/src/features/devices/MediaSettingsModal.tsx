import React, { useEffect, useState } from "react";
import { DeviceSelector } from "./DeviceSelector";
import { useModal } from "../../contexts/ModalContext";
import { useLocalPeer } from "./LocalPeerMediaContext";
import { Modal } from "../shared/components/modal/Modal";

export const MediaSettingsModal: React.FC = () => {
  const { setOpen, isOpen } = useModal();
  const { video, audio, start } = useLocalPeer();
  const [videoInput, setVideoInput] = useState<string | null>(null);
  const [audioInput, setAudioInput] = useState<string | null>(null);

  useEffect(() => {
    if (video.devices && video.id) {
      setVideoInput(video.id);
    }
  }, [video.devices, video.id]);

  useEffect(() => {
    if (audio.devices && audio.id) {
      setAudioInput(audio.id);
    }
  }, [audio.devices, audio.id]);

  const handleClose = () => {
    setOpen(false);
    setAudioInput(audio.id);
    setVideoInput(video.id);
  };

  return (
    <Modal
      title="Settings"
      confirmText="Save"
      onRequestClose={handleClose}
      closable
      cancelClassName="!text-additional-red-100"
      onConfirm={() => {
        start({
          audioDeviceId: audioInput || undefined,
          videoDeviceId: videoInput || undefined,
        });
        setOpen(false);
      }}
      onCancel={handleClose}
      maxWidth="max-w-md"
      isOpen={isOpen}
    >
      <DeviceSelector name="Select camera" devices={video.devices} setInput={setVideoInput} inputValue={videoInput} />
      <DeviceSelector
        name="Select microphone"
        devices={audio.devices}
        setInput={setAudioInput}
        inputValue={audioInput}
      />
    </Modal>
  );
};
