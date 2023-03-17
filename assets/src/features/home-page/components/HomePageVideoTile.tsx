import React, { useCallback, useEffect, useMemo, useState } from "react";
import MediaControlButton from "../../../pages/room/components/MediaControlButton";
import MediaPlayerTile from "../../../pages/room/components/StreamPlayer/MediaPlayerTile";
import { AUDIO_TRACKS_CONFIG, VIDEO_TRACKS_CONFIG } from "../../../pages/room/consts";
import { useMedia } from "../../../pages/room/hooks/useMedia";
import { usePeersState } from "../../../pages/room/hooks/usePeerState";
import { useSetLocalUserTrack } from "../../../pages/room/hooks/useSetLocalUserTrack";
import { TrackWithId } from "../../../pages/types";
import InitialsImage, { computeInitials } from "../../room-page/components/InitialsImage";
import { activeButtonStyle, neutralButtonStyle } from "../../room-page/consts";
import Camera from "../../room-page/icons/Camera";
import CameraOff from "../../room-page/icons/CameraOff";
import Microphone from "../../room-page/icons/Microphone";
import MicrophoneOff from "../../room-page/icons/MicrophoneOff";
import { remoteTrackToLocalTrack } from "../../room-page/utils/remoteTrackToLocalTrack";
import { usePreviewSettings } from "../hooks/usePreviewSettings";
import {
  AUDIO_TRACK_CONSTRAINS,
  UseEnumerateDevices,
  useEnumerateDevices,
  useMediaBase,
  useMediaGeneric,
  VIDEO_TRACK_CONSTRAINTS,
} from "@jellyfish-dev/jellyfish-reacy-client/navigator";
import { useLocalPeer } from "../../../contexts/LocalPeerContext";

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

function selectDeviceId(devices: MediaDeviceInfo[], lastSelectedDeviceId: string) {
  const result = devices.some(({ deviceId }) => deviceId === lastSelectedDeviceId);
  if (result) return lastSelectedDeviceId;

  const firstDevice = devices.find(({ deviceId }) => deviceId);
  if (firstDevice) return firstDevice.deviceId;

  return null;
}

type DeviceSelectorProps = {
  name: string;
  devices: UseEnumerateDevices | null;
  type: "audio" | "video";
  setDeviceId: (value: string | null) => void;
};

const DeviceSelector = ({ name, devices, type, setDeviceId }: DeviceSelectorProps) => {
  const okDevices = devicesOrNull(devices, type);

  const [lastSelectedId, setLastSelectedId] = useLocalStorageStateString(`last-selected-${type}-id`);
  const [input, setInput] = useState<string | null>(null);

  useEffect(() => {
    if (okDevices && lastSelectedId) {
      const result = selectDeviceId(okDevices, lastSelectedId);
      if (result) {
        setInput(result);
      }
    }
  }, [okDevices, lastSelectedId, type]);

  useEffect(() => {
    setDeviceId(input);
  }, [input, setDeviceId]);

  return (
    <select
      className="select select-bordered m-2 w-full max-w-xs"
      onChange={(event) => {
        setInput(event.target.value);
        setLastSelectedId(event.target.value);
      }}
      // defaultValue={getDefaultValue(lastSelectedDeviceId, enumerateDevicesState)}
      value={input || name}
    >
      <option disabled>{name}</option>
      {(okDevices || []).map(({ deviceId, label }) => (
        <option key={deviceId} value={deviceId}>
          {label}
        </option>
      ))}
    </select>
  );
};

const useLastSelectedDevice = (
  devices: MediaDeviceInfo[] | null,
  type: "video" | "audio",
  setDeviceId: (id: string | null) => void
) => {
  const [lastSelectedId, setLastSelectedId] = useLocalStorageStateString(`last-selected-${type}-id`);
  const [cameraInput, setCameraInput] = useState<string | null>(null);

  useEffect(() => {
    if (devices && lastSelectedId) {
      const result = selectDeviceId(devices, lastSelectedId);
      if (result) {
        setCameraInput(result);
      }
    }
  }, [devices, lastSelectedId, type]);

  useEffect(() => {
    setDeviceId(cameraInput);
  }, [cameraInput, setDeviceId]);

  return { setLastSelectedCameraId: setLastSelectedId, cameraInput, setCameraInput };
};

const devicesOrNull = (devices: UseEnumerateDevices | null, type: "audio" | "video") => {
  const device = devices?.[type];
  return device?.type === "OK" ? device.devices : null;
};

const HomePageVideoTile: React.FC<HomePageVideoTileProps> = ({ displayName }) => {
  const { setVideoDeviceId, setAudioDeviceId, videoDevice, audioDevice } = useLocalPeer();

  const devices = useEnumerateDevices(VIDEO_TRACK_CONSTRAINTS, AUDIO_TRACK_CONSTRAINS);

  const initials = computeInitials(displayName);

  return (
    <>
      <DeviceSelector name="Select camera" devices={devices} type={"video"} setDeviceId={setVideoDeviceId} />
      <DeviceSelector name="Select microphone" devices={devices} type={"audio"} setDeviceId={setAudioDeviceId} />
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
            </div>
          </>
        }
      />
    </>
  );
};

export default HomePageVideoTile;
