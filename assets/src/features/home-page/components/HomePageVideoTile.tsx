import React, { useEffect, useState } from "react";
import MediaControlButton from "../../../pages/room/components/MediaControlButton";
import MediaPlayerTile from "../../../pages/room/components/StreamPlayer/MediaPlayerTile";
import InitialsImage, { computeInitials } from "../../room-page/components/InitialsImage";
import { activeButtonStyle, neutralButtonStyle } from "../../room-page/consts";
import Camera from "../../room-page/icons/Camera";
import CameraOff from "../../room-page/icons/CameraOff";
import Microphone from "../../room-page/icons/Microphone";
import MicrophoneOff from "../../room-page/icons/MicrophoneOff";
import Settings from "../../room-page/icons/Settings";
import { ChosenMediaSource, MediaSettingsModal } from "../../shared/components/modal/MediaSettingsModal";
import {
  AUDIO_TRACK_CONSTRAINS,
  useEnumerateDevices,
  UseEnumerateDevices,
  VIDEO_TRACK_CONSTRAINTS,
} from "@jellyfish-dev/jellyfish-reacy-client/navigator";
import { useLocalPeer } from "../../../contexts/LocalPeerContext";
import Input from "../../shared/components/Input";
import { SelectOption } from "../../shared/components/Select";

type HomePageVideoTileProps = {
  displayName: string;
};

export const getStringValue = (name: string, defaultValue: string | null = null): string | null => {
  const stringValue = localStorage.getItem(name);
  if (stringValue === null || stringValue === undefined) {
    return defaultValue;
  }
  return stringValue;
};

export const useLocalStorageStateString = (name: string): [string | null, (newValue: string | null) => void] => {
  const [value, setValueState] = useState<string | null>(getStringValue(name));

  const setValue = (newValue: string | null) => {
    setValueState(newValue);
    if (newValue === null) {
      localStorage.removeItem(name);
    } else {
      localStorage.setItem(name, newValue);
    }
  };

  return [value, setValue];
};

export function selectDeviceId(devices: MediaDeviceInfo[], lastSelectedDeviceId: string) {
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
      label="ABC"
      type="select"
      placeholder="DEF"
      options={options}
      onChange={(option) => {
        setInput(option.value);
      }}
      value="6cb95ce2523c18a3f5c1da349a8556a4c66576de39ccfd6def2c06ee1fe04528"
    />
  );
};

export const devicesOrNull = (devices: UseEnumerateDevices | null, type: "audio" | "video") => {
  const device = devices?.[type];
  return device?.type === "OK" ? device.devices : null;
};

const HomePageVideoTile: React.FC<HomePageVideoTileProps> = ({ displayName }) => {
  const { setVideoDeviceId, setAudioDeviceId, videoDevice, audioDevice } = useLocalPeer();

  const devices = useEnumerateDevices(VIDEO_TRACK_CONSTRAINTS, AUDIO_TRACK_CONSTRAINS);

  const initials = computeInitials(displayName);

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const onCancelSettings = () => {
    setIsSettingsOpen(false);
  };

  const onConfirmSettings = (settings: ChosenMediaSource) => {
    console.log("settings", settings);
    setIsSettingsOpen(false);
  };

  return (
    <>
      <MediaSettingsModal isOpen={isSettingsOpen} onCancel={onCancelSettings} onConfirm={onConfirmSettings} />
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
                  className={neutralButtonStyle}
                  onClick={() => {
                    videoDevice.stop();
                  }}
                />
              ) : (
                <MediaControlButton
                  key={"cam-on"}
                  icon={CameraOff}
                  hover="Turn on the camera"
                  className={activeButtonStyle}
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
                  className={neutralButtonStyle}
                  onClick={() => {
                    audioDevice.stop();
                  }}
                />
              ) : (
                <MediaControlButton
                  key={"mic-unmute"}
                  icon={MicrophoneOff}
                  hover="Turn on the microphone"
                  className={activeButtonStyle}
                  onClick={() => {
                    audioDevice.start();
                  }}
                />
              )}
              <MediaControlButton
                key={"settings"}
                icon={Settings}
                hover="Open Settings"
                className={neutralButtonStyle}
                onClick={() => {
                  setIsSettingsOpen(true);
                }}
              />
            </div>
          </>
        }
      />
    </>
  );
};

export default HomePageVideoTile;
