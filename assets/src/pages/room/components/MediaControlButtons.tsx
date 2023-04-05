import React, { FC } from "react";

import { UseMediaResult } from "../hooks/useMedia";
import MediaControlButton, { MediaControlButtonProps } from "./MediaControlButton";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { MembraneStreaming, StreamingMode } from "../hooks/useMembraneMediaStreaming";
import { useToggle } from "../hooks/useToggle";
import Microphone from "../../../features/room-page/icons/Microphone";
import MicrophoneOff from "../../../features/room-page/icons/MicrophoneOff";
import Camera from "../../../features/room-page/icons/Camera";
import CameraOff from "../../../features/room-page/icons/CameraOff";
import Screenshare from "../../../features/room-page/icons/Screenshare";
import HangUp from "../../../features/room-page/icons/HangUp";
import Chat from "../../../features/room-page/icons/Chat";
import useSmartphoneViewport from "../../../features/shared/hooks/useSmartphoneViewport";
import MenuDots from "../../../features/room-page/icons/MenuDots";
import { activeButtonStyle, neutralButtonStyle, redButtonStyle } from "../../../features/room-page/consts";

type ControlButton = MediaControlButtonProps & { id: string };

const getAutomaticControls = (
  {
    userMediaAudio,
    audioStreaming,
    userMediaVideo,
    cameraStreaming,
    displayMedia,
    screenSharingStreaming,
    isSidebarOpen,
    openSidebar,
  }: LocalUserMediaControls,
  navigate: NavigateFunction,
  isMobileViewport?: boolean,
  roomId?: string
): ControlButton[] => [
  userMediaVideo.isEnabled
    ? {
        id: "cam-off",
        icon: Camera,
        hover: "Turn off the camera",
        className: neutralButtonStyle,
        onClick: () => {
          userMediaVideo.disable();
          cameraStreaming.setActive(false);
        },
      }
    : {
        id: "cam-on",
        hover: "Turn on the camera",
        icon: CameraOff,
        className: activeButtonStyle,
        onClick: () => {
          if (userMediaVideo.stream) {
            userMediaVideo.enable();
          } else {
            userMediaVideo.start();
          }
          cameraStreaming.setActive(true);
        },
      },
  userMediaAudio.isEnabled
    ? {
        id: "mic-mute",
        icon: Microphone,
        hover: "Turn off the microphone",
        className: neutralButtonStyle,
        onClick: () => {
          userMediaAudio.disable();
          audioStreaming.setActive(false);
        },
      }
    : {
        id: "mic-unmute",
        icon: MicrophoneOff,
        hover: "Turn on the microphone",
        className: activeButtonStyle,
        onClick: () => {
          if (userMediaAudio.stream) {
            userMediaAudio.enable();
          } else {
            userMediaAudio.start();
          }
          audioStreaming.setActive(true);
        },
      },
  displayMedia.stream
    ? {
        id: "screenshare-stop",
        icon: Screenshare,
        hover: "Stop sharing your screen",
        className: neutralButtonStyle,
        hideOnMobile: true,
        onClick: () => {
          displayMedia.stop();
          screenSharingStreaming.setActive(false);
        },
      }
    : {
        id: "screenshare-start",
        icon: Screenshare,
        hover: "Share your screen",
        className: neutralButtonStyle,
        hideOnMobile: true,
        onClick: () => {
          displayMedia.start();
          screenSharingStreaming.setActive(true);
        },
      },
  {
    id: "chat",
    icon: isMobileViewport ? MenuDots : Chat,
    hover: isMobileViewport ? undefined : isSidebarOpen ? "Close the sidebar" : "Open the sidebar",
    className: isSidebarOpen ? activeButtonStyle : neutralButtonStyle,
    onClick: openSidebar,
  },
  {
    id: "leave-room",
    icon: HangUp,
    hover: "Leave the room",
    className: redButtonStyle,
    onClick: () => {
      navigate(`/room/${roomId}`, { state: { isLeavingRoom: true } });
    },
  },
];

//dev helpers
const getManualControls = (
  {
    userMediaAudio,
    audioStreaming,
    userMediaVideo,
    cameraStreaming,
    displayMedia,
    screenSharingStreaming,
  }: LocalUserMediaControls,
  navigate: NavigateFunction,
  roomId?: string
): ControlButton[][] => [
  [
    userMediaAudio.stream
      ? {
          id: "mic-stop",
          icon: Microphone,
          className: neutralButtonStyle,
          hover: "Start the microphone",
          onClick: () => userMediaAudio.stop(),
        }
      : {
          id: "mic-start",
          icon: MicrophoneOff,
          className: activeButtonStyle,
          hover: "Stop the microphone",
          onClick: () => userMediaAudio.start(),
        },
    userMediaAudio.isEnabled
      ? {
          id: "mic-disable",
          icon: Microphone,
          className: neutralButtonStyle,
          hover: "Disable microphone stream",
          onClick: () => userMediaAudio.disable(),
        }
      : {
          id: "mic-enable",
          icon: MicrophoneOff,
          className: activeButtonStyle,
          hover: "Enable microphone stream",
          onClick: () => userMediaAudio.enable(),
        },
    audioStreaming.trackId
      ? {
          id: "mic-remove",
          icon: Microphone,
          className: neutralButtonStyle,
          hover: "Remove microphone track",
          onClick: () => audioStreaming.removeTracks(),
        }
      : {
          id: "mic-add",
          icon: MicrophoneOff,
          className: activeButtonStyle,
          hover: "Add microphone track",
          onClick: () => userMediaAudio?.stream && audioStreaming.addTracks(userMediaAudio?.stream),
        },
    audioStreaming.trackMetadata?.active
      ? {
          id: "mic-metadata-false",
          icon: Microphone,
          className: neutralButtonStyle,
          hover: "Set 'active' metadata to 'false'",
          onClick: () => audioStreaming.setActive(false),
        }
      : {
          id: "mic-metadata-true",
          icon: MicrophoneOff,
          className: activeButtonStyle,
          hover: "Set 'active' metadata to 'true'",
          onClick: () => audioStreaming.setActive(true),
        },
  ],
  [
    userMediaVideo.stream
      ? {
          id: "cam-stop",
          icon: Camera,
          className: neutralButtonStyle,
          hover: "Turn off the camera",
          onClick: () => userMediaVideo.stop(),
        }
      : {
          id: "cam-start",
          hover: "Turn on the camera",
          icon: CameraOff,
          className: activeButtonStyle,
          onClick: () => userMediaVideo.start(),
        },
    userMediaVideo.isEnabled
      ? {
          id: "cam-disable",
          icon: Camera,
          className: neutralButtonStyle,
          hover: "Disable the camera stream",
          onClick: () => userMediaVideo.disable(),
        }
      : {
          id: "cam-enable",
          hover: "Enable the the camera stream",
          icon: CameraOff,
          className: activeButtonStyle,
          onClick: () => userMediaVideo.enable(),
        },
    cameraStreaming.trackId
      ? {
          id: "cam-remove",
          icon: Camera,
          className: neutralButtonStyle,
          hover: "Remove camera track",
          onClick: () => cameraStreaming.removeTracks(),
        }
      : {
          id: "cam-add",
          icon: CameraOff,
          className: activeButtonStyle,
          hover: "Add camera track",
          onClick: () => userMediaVideo?.stream && cameraStreaming.addTracks(userMediaVideo?.stream),
        },
    cameraStreaming.trackMetadata?.active
      ? {
          id: "cam-metadata-false",
          icon: Camera,
          className: neutralButtonStyle,
          hover: "Set 'active' metadata to 'false'",
          onClick: () => cameraStreaming.setActive(false),
        }
      : {
          id: "cam-metadata-true",
          icon: CameraOff,
          className: activeButtonStyle,
          hover: "Set 'active' metadata to 'true'",
          onClick: () => cameraStreaming.setActive(true),
        },
  ],
  [
    displayMedia.stream
      ? {
          id: "screen-stop",
          icon: Screenshare,
          className: neutralButtonStyle,
          hover: "Stop the screensharing",
          hideOnMobile: true,
          onClick: () => displayMedia.stop(),
        }
      : {
          id: "screen-start",
          icon: Screenshare,
          className: neutralButtonStyle,
          hover: "Start the screensharing",
          hideOnMobile: true,
          onClick: () => displayMedia.start(),
        },
    displayMedia.isEnabled
      ? {
          id: "screen-disable",
          icon: Screenshare,
          className: neutralButtonStyle,
          hover: "Disable screensharing stream",
          hideOnMobile: true,
          onClick: () => displayMedia.disable(),
        }
      : {
          id: "screen-enable",
          icon: Screenshare,
          className: neutralButtonStyle,
          hover: "Enable screensharing stream",
          hideOnMobile: true,
          onClick: () => displayMedia.enable(),
        },
    screenSharingStreaming.trackId
      ? {
          id: "screen-remove",
          icon: Screenshare,
          className: neutralButtonStyle,
          hover: "Remove screensharing track",
          hideOnMobile: true,
          onClick: () => screenSharingStreaming.removeTracks(),
        }
      : {
          id: "screen-add",
          icon: Screenshare,
          className: neutralButtonStyle,
          hover: "Add screensharing track",
          hideOnMobile: true,
          onClick: () => displayMedia?.stream && screenSharingStreaming.addTracks(displayMedia?.stream),
        },
    screenSharingStreaming.trackMetadata?.active
      ? {
          id: "screen-metadata-false",
          icon: Screenshare,
          className: neutralButtonStyle,
          hover: "Set 'active' metadata to 'false'",
          hideOnMobile: true,
          onClick: () => screenSharingStreaming.setActive(false),
        }
      : {
          id: "screen-metadata-true",
          icon: Screenshare,
          className: neutralButtonStyle,
          hover: "Set 'active' metadata to 'true'",
          hideOnMobile: true,
          onClick: () => screenSharingStreaming.setActive(true),
        },
  ],
  [
    {
      id: "leave-room",
      icon: HangUp,
      hover: "Leave the room",
      className: redButtonStyle,
      onClick: () => {
        navigate(`/room/${roomId}`, { state: { isLeavingRoom: true } });
      },
    },
  ],
];

type Props = {
  mode: StreamingMode;
} & LocalUserMediaControls;

type LocalUserMediaControls = {
  userMediaVideo: UseMediaResult;
  cameraStreaming: MembraneStreaming;
  userMediaAudio: UseMediaResult;
  audioStreaming: MembraneStreaming;
  displayMedia: UseMediaResult;
  screenSharingStreaming: MembraneStreaming;
  isSidebarOpen?: boolean;
  openSidebar: () => void;
};

const MediaControlButtons: FC<Props> = (props: Props) => {
  const [show, toggleShow] = useToggle(true);
  const { isSmartphone } = useSmartphoneViewport();
  const { roomId } = useParams();

  const navigate = useNavigate();

  const controls: ControlButton[][] =
    props.mode === "manual"
      ? getManualControls(props, navigate)
      : [getAutomaticControls(props, navigate, isSmartphone, roomId)];
  return (
    <div>
      <div
        onClick={toggleShow}
        className="absolute left-1/2 top-[-15px] z-[-10] h-[15px] w-[50px] -translate-x-1/2 rounded-t-lg hover:bg-brand-dark-gray/90"
      ></div>
      {show && (
        <div className="inset-x-0 z-10 flex flex-wrap justify-center gap-x-4 rounded-t-md">
          {controls.map((group, index) => (
            <div key={index} className="flex justify-center gap-x-4">
              {group.map(({ hover, onClick, className, id, icon, hideOnMobile }) => (
                <MediaControlButton
                  key={id}
                  onClick={onClick}
                  hover={hover}
                  className={className}
                  icon={icon}
                  hideOnMobile={hideOnMobile}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaControlButtons;
