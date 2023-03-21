import React from "react";
import MediaControlButton from "../../../pages/room/components/MediaControlButton";
import MediaPlayerTile from "../../../pages/room/components/StreamPlayer/MediaPlayerTile";
import InitialsImage, { computeInitials } from "../../room-page/components/InitialsImage";
import { activeButtonStyle, neutralButtonStyle } from "../../room-page/consts";
import Camera from "../../room-page/icons/Camera";
import CameraOff from "../../room-page/icons/CameraOff";
import Microphone from "../../room-page/icons/Microphone";
import MicrophoneOff from "../../room-page/icons/MicrophoneOff";
import Settings from "../../room-page/icons/Settings";
import { UseEnumerateDevices } from "@jellyfish-dev/jellyfish-reacy-client/navigator";
import { useLocalPeer } from "../../../contexts/LocalPeerContext";
import Input from "../../shared/components/Input";
import { SelectOption } from "../../shared/components/Select";
import { useModal } from "../../../contexts/ModalContext";

type HomePageVideoTileProps = {
  displayName: string;
};

export const getLocalStorageItem = (name: string, defaultValue: string | null = null): string | null => {
  const stringValue = localStorage.getItem(name);
  if (stringValue === null || stringValue === undefined) {
    return defaultValue;
  }
  return stringValue;
};

export function selectDeviceId(devices: MediaDeviceInfo[], lastSelectedDeviceId: string | null) {
  const result = devices.some(({ deviceId }) => deviceId === lastSelectedDeviceId);
  if (result) return lastSelectedDeviceId;

  const firstDevice = devices.find(({ deviceId }) => deviceId);
  if (firstDevice) return firstDevice.deviceId;

  return null;
}

type DeviceSelectorProps = {
  name: string;
  devices: MediaDeviceInfo[] | null;
  setInput: (value: string | null) => void;
  inputValue: string | null;
};

export const DeviceSelector = ({ name, devices, setInput, inputValue }: DeviceSelectorProps) => {
  const options: SelectOption[] = (devices || []).map(({ deviceId, label }) => ({
    value: deviceId,
    label,
  }));

  return (
    <Input
      wrapperClassName="mt-14"
      label={name}
      type="select"
      placeholder="DEF"
      options={options}
      onChange={(option) => {
        setInput(option.value);
      }}
      value={options.find(({ value }) => value === inputValue)}
    />
  );
};

export const devicesOrNull = (devices: UseEnumerateDevices | null, type: "audio" | "video") => {
  const device = devices?.[type];
  return device?.type === "OK" ? device.devices : null;
};

const HomePageVideoTile: React.FC<HomePageVideoTileProps> = ({ displayName }) => {
  const { videoDevice, audioDevice } = useLocalPeer();

  const initials = computeInitials(displayName);
  const { setOpen } = useModal();

  return (
    <MediaPlayerTile
      key="room-preview"
      peerId={""}
      video={{ stream: videoDevice.stream || undefined, remoteTrackId: "" }}
      audio={null}
      streamSource="local"
      flipHorizontally
      layers={
        <>
          {!videoDevice.isEnabled ? <InitialsImage initials={initials} /> : null}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform gap-x-4">
            {videoDevice.isEnabled ? (
              <MediaControlButton
                key={"cam-off"}
                icon={Camera}
                hover="Turn off the camera"
                buttonClassName={neutralButtonStyle}
                onClick={() => {
                  videoDevice.stop();
                }}
              />
            ) : (
              <MediaControlButton
                key={"cam-on"}
                icon={CameraOff}
                hover="Turn on the camera"
                buttonClassName={activeButtonStyle}
                onClick={() => {
                  videoDevice.start();
                }}
              />
            )}
            {audioDevice.isEnabled ? (
              <MediaControlButton
                key={"mic-mute"}
                icon={Microphone}
                hover="Turn off the microphone"
                buttonClassName={neutralButtonStyle}
                onClick={() => {
                  audioDevice.stop();
                }}
              />
            ) : (
              <MediaControlButton
                key={"mic-unmute"}
                icon={MicrophoneOff}
                hover="Turn on the microphone"
                buttonClassName={activeButtonStyle}
                onClick={() => {
                  audioDevice.start();
                }}
              />
            )}
            <MediaControlButton
              key={"settings"}
              icon={Settings}
              hover="Open Settings"
              buttonClassName={neutralButtonStyle}
              onClick={() => {
                setOpen(true);
              }}
            />
          </div>
        </>
      }
    />
  );
};

export default HomePageVideoTile;
