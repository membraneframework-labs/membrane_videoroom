import React, { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { DeviceSelector } from "../../../home-page/components/HomePageVideoTile";
import { useLocalPeer } from "../../../../contexts/LocalPeerContext";
import { useModal } from "../../../../contexts/ModalContext";

export const MediaSettingsModal: React.FC = () => {
  const { setOpen, isOpen } = useModal();
  const { setVideoDeviceId, videoDeviceId, setAudioDeviceId, audioDeviceId } = useLocalPeer();
  const [videoInput, setVideoInput] = useState<string | null>(null);
  const [audioInput, setAudioInput] = useState<string | null>(null);
  const { videoDevices, audioDevices } = useLocalPeer();

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

  return (
    <Modal
      title="Settings"
      confirmText="Save"
      onRequestClose={() => {
        setOpen(false);
      }}
      closable
      cancelClassName="text-additional-red-100"
      onConfirm={() => {
        setAudioDeviceId(audioInput);
        setVideoDeviceId(videoInput);
        setOpen(false);
      }}
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
