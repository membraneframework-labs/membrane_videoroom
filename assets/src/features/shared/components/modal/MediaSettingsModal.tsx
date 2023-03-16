import React from "react";
import Input from "../Input";
import { SelectOption } from "../Select";
import { Modal } from "./Modal";

export type ChosenMediaSource = {
  camera: string | null;
  mic: string | null;
};

interface Props {
  isOpen: boolean;
  onCancel?: () => void;
  onConfirm?: (settings: ChosenMediaSource) => void;
}

export const MediaSettingsModal: React.FC<Props> = ({ onConfirm, ...props }) => {
  const options: SelectOption[] = new Array(5).fill(0).map((_, i) => {
    return { value: `option ${i}`, label: `option ${i}` };
  });

  const [chosenMic, setChosenMic] = React.useState<SelectOption>(options[0]);
  const [chosenCamera, setChosenCamera] = React.useState<SelectOption>(options[0]);

  const onSettingsConfirm = () => {
    onConfirm?.call(null, { camera: chosenCamera.value, mic: chosenMic.value });
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
        wrapperClassName="mt-14"
        label="Microphone"
        type="select"
        placeholder="Select microphone"
        options={options}
        onChange={(v) => setChosenMic(v)}
        defaultValue={chosenMic}
      />

      <Input
        wrapperClassName="mt-5"
        label="Camera"
        type="select"
        placeholder="Select camera"
        options={options}
        onChange={(v) => setChosenCamera(v)}
        defaultValue={chosenCamera}
      />
    </Modal>
  );
};
