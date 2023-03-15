import React from "react";
import Input from "../Input";
import { Modal } from "./Modal";

type ChosenMediaSource = {
  camera: string | null;
  mic: string | null;
};

interface Props {
  isOpen: boolean;
  onCancel?: () => void;
  onConfirm?: (setting: ChosenMediaSource) => void;
}

export const MediaSettingsModal: React.FC<Props> = ({ onConfirm, ...props }) => {
  const [chosenMic, setChosenMic] = React.useState<string | null>(null);
  const [chosenCamera, setChosenCamera] = React.useState<string | null>(null);

  const onSettingsConfirm = () => {
    console.log("chosenMic", chosenMic);
    console.log("chosenCamera", chosenCamera);
    onConfirm?.call(null, { camera: chosenCamera, mic: chosenMic });
  };

  return (
    <Modal
      title="Settings"
      confirmText="Save"
      onRequestClose={props.onCancel}
      closable
      cancelClassName="text-additional-red-100"
      onConfirm={onSettingsConfirm}
      maxWidth="max-w-md"
      {...props}
    >
      <Input
        wrapperClassName="mt-7"
        label="Microphone"
        type="select"
        placeholder="Select microphone"
        options={new Array(5).fill(0).map((_, i) => {
          return { value: `option ${i}`, label: `option ${i}` };
        })}
        onChange={(v) => setChosenMic(v)}
      />

      <Input
        wrapperClassName="mt-5"
        label="Camera"
        type="select"
        placeholder="Select camera"
        options={new Array(5).fill(0).map((_, i) => {
          return { value: `option ${i}`, label: `option ${i}` };
        })}
        onChange={(v) => setChosenCamera(v)}
      />
    </Modal>
  );
};
