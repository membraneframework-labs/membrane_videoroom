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
  setInput: (value: ((prevState: string | null) => string | null) | string | null) => void;
  setLastSelectedDeviceId: (newValue: string | null) => void;
  input: string | null;
  devices: UseEnumerateDevices | null;
};

const DeviceSelector = ({ name, setInput, setLastSelectedDeviceId, input, devices }: DeviceSelectorProps) => (
  <select
    className="select select-bordered m-2 w-full max-w-xs"
    onChange={(event) => {
      setInput(event.target.value);
      setLastSelectedDeviceId(event.target.value);
    }}
    // defaultValue={getDefaultValue(lastSelectedDeviceId, enumerateDevicesState)}
    value={input || name}
  >
    <option disabled>{name}</option>
    {devices?.video.type === "OK" &&
      devices.video?.devices?.map(({ deviceId, label }) => (
        <option key={deviceId} value={deviceId}>
          {label}
        </option>
      ))}
  </select>
);

const HomePageVideoTile: React.FC<HomePageVideoTileProps> = ({ displayName }) => {
  const { cameraAutostart, audioAutostart } = usePreviewSettings();
  const { setVideoDeviceId, videoDevice, audioDevice } = useLocalPeer();

  const devices = useEnumerateDevices(VIDEO_TRACK_CONSTRAINTS, AUDIO_TRACK_CONSTRAINS);

  const [lastSelectedCameraId, setLastSelectedCameraId] = useLocalStorageStateString("last-selected-camera-id");
  const [cameraInput, setCameraInput] = useState<string | null>(null);

  // useEffect(() => {
  //   console.log({ peerState });
  // }, [peerState]);

  useEffect(() => {
    if (devices?.video.type === "OK" && lastSelectedCameraId) {
      const result = selectDeviceId(devices.video.devices, lastSelectedCameraId);
      if (result) {
        setCameraInput(result);
      }
    }
  }, [devices, lastSelectedCameraId]);

  const initials = computeInitials(displayName);

  useEffect(() => {
    setVideoDeviceId(cameraInput);
  }, [cameraInput, setVideoDeviceId]);

  return (
    <>
      <DeviceSelector
        name="Select camera"
        setInput={setCameraInput}
        setLastSelectedDeviceId={setLastSelectedCameraId}
        input={cameraInput}
        devices={devices}
      />
      <MediaPlayerTile
        key="room-preview"
        peerId={""}
        video={{ stream: videoDevice.stream || undefined, remoteTrackId: "" }}
        audio={null}
        streamSource="local"
        flipHorizontally
        layers={
          <>
            {!cameraAutostart.status || !videoDevice.isEnabled ? <InitialsImage initials={initials} /> : null}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform gap-x-4">
              {videoDevice.isEnabled ? (
                <MediaControlButton
                  key={"cam-off"}
                  icon={Camera}
                  hover="Turn off the camera"
                  className={neutralButtonStyle}
                  onClick={() => {
                    videoDevice.stop();
                    cameraAutostart.setCameraAutostart(false);
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
                    cameraAutostart.setCameraAutostart(true);
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
                    audioDevice.disable();
                    audioAutostart.setAudioAutostart(false);
                  }}
                />
              ) : (
                <MediaControlButton
                  key={"mic-unmute"}
                  icon={MicrophoneOff}
                  hover="Turn on the microphone"
                  className={activeButtonStyle}
                  onClick={() => {
                    if (audioDevice.stream) {
                      audioDevice.enable();
                    } else {
                      audioDevice.start();
                    }
                    audioAutostart.setAudioAutostart(true);
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
