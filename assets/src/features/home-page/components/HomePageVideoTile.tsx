import React from "react";
import MediaControlButton from "../../../pages/room/components/MediaControlButton";
import InitialsImage, { computeInitials } from "../../room-page/components/InitialsImage";
import { activeButtonStyle, neutralButtonStyle } from "../../room-page/consts";
import Camera from "../../room-page/icons/Camera";
import CameraOff from "../../room-page/icons/CameraOff";
import Microphone from "../../room-page/icons/Microphone";
import MicrophoneOff from "../../room-page/icons/MicrophoneOff";
import Settings from "../../room-page/icons/Settings";
import { useModal } from "../../../contexts/ModalContext";
import { useLocalPeer } from "../../devices/LocalPeerMediaContext";
import GenericMediaPlayerTile from "../../../pages/room/components/StreamPlayer/GenericMediaPlayerTile";

type HomePageVideoTileProps = {
  displayName: string;
};

const HomePageVideoTile: React.FC<HomePageVideoTileProps> = ({ displayName }) => {
  const { audio, video } = useLocalPeer();

  const initials = computeInitials(displayName);
  const { setOpen } = useModal();

  return (
    <div className="h-full w-full">
      <GenericMediaPlayerTile
        video={video.device.stream || null}
        audio={null}
        flipHorizontally
        layers={
          <>
            {!video.device.isEnabled ? <InitialsImage initials={initials} /> : null}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform gap-x-4">
              {video.device.isEnabled ? (
                <MediaControlButton
                  icon={Camera}
                  hover="Turn off the camera"
                  buttonClassName={neutralButtonStyle}
                  onClick={() => {
                    video.device.stop();
                  }}
                />
              ) : (
                <MediaControlButton
                  icon={CameraOff}
                  hover="Turn on the camera"
                  buttonClassName={activeButtonStyle}
                  onClick={() => {
                    if (video.device.stream) {
                      video.device.enable();
                    } else {
                      video.device.start();
                    }
                  }}
                />
              )}
              {audio.device.isEnabled ? (
                <MediaControlButton
                  icon={Microphone}
                  hover="Turn off the microphone"
                  buttonClassName={neutralButtonStyle}
                  onClick={() => {
                    audio.device.stop();
                  }}
                />
              ) : (
                <MediaControlButton
                  icon={MicrophoneOff}
                  hover="Turn on the microphone"
                  buttonClassName={activeButtonStyle}
                  onClick={() => {
                    if (audio.device.stream) {
                      audio.device.enable();
                    } else {
                      audio.device.start();
                    }
                  }}
                />
              )}
              <MediaControlButton
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
    </div>
  );
};

export default HomePageVideoTile;
