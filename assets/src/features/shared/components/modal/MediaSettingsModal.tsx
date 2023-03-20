import React, { useEffect, useState } from "react";
import { SelectOption } from "../Select";
import { Modal } from "./Modal";
import {
  AUDIO_TRACK_CONSTRAINS,
  useEnumerateDevices,
  VIDEO_TRACK_CONSTRAINTS,
} from "@jellyfish-dev/jellyfish-reacy-client/navigator";
import { DeviceSelector } from "../../../home-page/components/HomePageVideoTile";
import { useLocalPeer } from "../../../../contexts/LocalPeerContext";
import { UseEnumerateDevices } from "@jellyfish-dev/jellyfish-reacy-client/dist/navigator";

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
  const { setVideoDeviceId, videoDeviceId, setAudioDeviceId, audioDeviceId } = useLocalPeer();
  const [videoInput, setVideoInput] = useState<string | null>(null);
  const [audioInput, setAudioInput] = useState<string | null>(null);
  const { allVideoDevices, allAudioDevices } = useLocalPeer();

  // const onSettingsConfirm = () => {
  //   onConfirm?.call(null, { camera: chosenCamera.value, mic: chosenMic.value });
  // };

  useEffect(() => {
    if (allVideoDevices && videoDeviceId) {
      console.log("Setting video input...")
      setVideoInput(videoDeviceId)
    }
  }, [allVideoDevices, videoDeviceId]);

  console.log({videoInput})

  return (
    <Modal
      title="Settings"
      confirmText="Save"
      onRequestClose={props.onCancel}
      closable
      cancelClassName="text-additional-red-100"
      onConfirm={() => {
        setAudioDeviceId(audioInput)
        setVideoDeviceId(videoInput)
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
      {/*<Input*/}
      {/*  wrapperClassName="mt-14"*/}
      {/*  label="Microphone"*/}
      {/*  type="select"*/}
      {/*  placeholder="Select microphone"*/}
      {/*  options={options}*/}
      {/*  onChange={(v) => setChosenMic(v)}*/}
      {/*  defaultValue={chosenMic}*/}
      {/*/>*/}

      {/*<Input*/}
      {/*  wrapperClassName="mt-5"*/}
      {/*  label="Camera"*/}
      {/*  type="select"*/}
      {/*  placeholder="Select camera"*/}
      {/*  options={options}*/}
      {/*  onChange={(v) => setChosenCamera(v)}*/}
      {/*  defaultValue={chosenCamera}*/}
      {/*/>*/}
    </Modal>
  );
};
