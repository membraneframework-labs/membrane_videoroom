import React, { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { DeviceSelector } from "../../../home-page/components/HomePageVideoTile";
import { useLocalPeer } from "../../../../contexts/LocalPeerContext";

export type ChosenMediaSource = {
  camera: string | null;
  mic: string | null;
};

interface Props {
  isOpen: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export const MediaSettingsModal: React.FC<Props> = ({ onConfirm, ...props }) => {
  const { setVideoDeviceId, videoDeviceId, setAudioDeviceId, audioDeviceId } = useLocalPeer();
  const [videoInput, setVideoInput] = useState<string | null>(null);
  const [audioInput, setAudioInput] = useState<string | null>(null);
  const { allVideoDevices, allAudioDevices } = useLocalPeer();

  useEffect(() => {
    if (allVideoDevices && videoDeviceId) {
      console.log("Setting video input...");
      setVideoInput(videoDeviceId);
    }
  }, [allVideoDevices, videoDeviceId]);

  useEffect(() => {
    if (allAudioDevices && audioDeviceId) {
      console.log("Setting audio input...");
      setAudioInput(audioDeviceId);
    }
  }, [allAudioDevices, audioDeviceId]);

  return (
    <Modal
      title="Settings"
      confirmText="Save"
      onRequestClose={props.onCancel}
      closable
      cancelClassName="text-additional-red-100"
      onConfirm={() => {
        setAudioDeviceId(audioInput);
        setVideoDeviceId(videoInput);
        onConfirm?.();
      }}
      maxWidth="max-w-md"
      {...props}
    >
      <DeviceSelector name="Select camera" devices={allVideoDevices} setInput={setVideoInput} inputValue={videoInput} />
      <DeviceSelector
        name="Select microphone"
        devices={allAudioDevices}
        setInput={setAudioInput}
        inputValue={audioInput}
      />
    </Modal>
  );
};
