import React, { FC } from "react";

import MediaControlButton, { MediaControlButtonProps } from "./MediaControlButton";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { StreamingMode } from "../hooks/useMembraneMediaStreaming";
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
import { SCREENSHARING_MEDIA_CONSTRAINTS } from "../consts";
import { LocalPeerContext, useLocalPeer } from "../../../features/devices/LocalPeerMediaContext";
import { StreamingContext, useStreaming } from "../../../features/streaming/StreamingContext";
import { useDeveloperInfo } from "../../../contexts/DeveloperInfoContext";

type ControlButton = MediaControlButtonProps & { id: string };

type Sidebar = {
  isSidebarOpen: boolean;
  openSidebar: () => void;
};

const getAutomaticControls = (
  { microphone, camera, screenShare }: StreamingContext,
  local: LocalPeerContext,
  navigate: NavigateFunction,
  roomId: string | null,
  isSidebarOpen: boolean,
  openSidebar: () => void,
  isMobileViewport?: boolean
): ControlButton[] => [
  local.video.device.isEnabled
    ? {
        id: "cam-off",
        icon: Camera,
        hover: "Turn off the camera",
        buttonClassName: neutralButtonStyle,
        onClick: () => {
          local.video.device.disable();
          camera.setActive(false);
        },
      }
    : {
        id: "cam-on",
        hover: "Turn on the camera",
        icon: CameraOff,
        buttonClassName: activeButtonStyle,
        onClick: () => {
          if (local.video.device.stream) {
            local.video.device.enable();
          } else {
            local.video.device.start();
          }
          camera.setActive(true);
        },
      },
  local.audio.device.isEnabled
    ? {
        id: "mic-mute",
        icon: Microphone,
        hover: "Turn off the microphone",
        buttonClassName: neutralButtonStyle,
        onClick: () => {
          local.audio.device.disable();
          microphone.setActive(false);
        },
      }
    : {
        id: "mic-unmute",
        icon: MicrophoneOff,
        hover: "Turn on the microphone",
        buttonClassName: activeButtonStyle,
        onClick: () => {
          if (local.audio.device.stream) {
            local.audio.device.enable();
          } else {
            local.audio.device.start();
          }
          microphone.setActive(true);
        },
      },
  local.screenShare.device.stream
    ? {
        id: "screenshare-stop",
        icon: Screenshare,
        hover: "Stop sharing your screen",
        buttonClassName: neutralButtonStyle,
        hideOnMobile: true,
        onClick: () => {
          local.screenShare.setConfig(null);
          screenShare.setActive(false);
        },
      }
    : {
        id: "screenshare-start",
        icon: Screenshare,
        hover: "Share your screen",
        buttonClassName: neutralButtonStyle,
        hideOnMobile: true,
        onClick: () => {
          local.screenShare.setConfig(SCREENSHARING_MEDIA_CONSTRAINTS);
          screenShare.setActive(true);
        },
      },
  {
    id: "chat",
    icon: isMobileViewport ? MenuDots : Chat,
    hover: isMobileViewport ? undefined : isSidebarOpen ? "Close the sidebar" : "Open the sidebar",
    buttonClassName: isSidebarOpen ? activeButtonStyle : neutralButtonStyle,
    onClick: openSidebar,
  },
  {
    id: "leave-room",
    icon: HangUp,
    hover: "Leave the room",
    buttonClassName: redButtonStyle,
    onClick: () => {
      navigate(`/room/${roomId}`, { state: { isLeavingRoom: true } });
    },
  },
];

//dev helpers
const getManualControls = (
  { microphone, camera, screenShare }: StreamingContext,
  local: LocalPeerContext,
  navigate: NavigateFunction,
  roomId?: string
): ControlButton[][] => [
  [
    local.audio.device.stream
      ? {
          id: "mic-stop",
          icon: Microphone,
          buttonClassName: neutralButtonStyle,
          hover: "Start the microphone",
          onClick: () => local.audio.device.stop(),
        }
      : {
          id: "mic-start",
          icon: MicrophoneOff,
          buttonClassName: activeButtonStyle,
          hover: "Stop the microphone",
          onClick: () => local.audio.device.start(),
        },
    local.audio.device.isEnabled
      ? {
          id: "mic-disable",
          icon: Microphone,
          buttonClassName: neutralButtonStyle,
          hover: "Disable microphone stream",
          onClick: () => local.audio.device.disable(),
        }
      : {
          id: "mic-enable",
          icon: MicrophoneOff,
          buttonClassName: activeButtonStyle,
          hover: "Enable microphone stream",
          onClick: () => local.audio.device.enable(),
        },
    microphone.trackId
      ? {
          id: "mic-remove",
          icon: Microphone,
          buttonClassName: neutralButtonStyle,
          hover: "Remove microphone track",
          onClick: () => microphone.removeTracks(),
        }
      : {
          id: "mic-add",
          icon: MicrophoneOff,
          buttonClassName: activeButtonStyle,
          hover: "Add microphone track",
          onClick: () => local.audio.device?.stream && microphone.addTracks(local.audio.device?.stream),
        },
    microphone.trackMetadata?.active
      ? {
          id: "mic-metadata-false",
          icon: Microphone,
          buttonClassName: neutralButtonStyle,
          hover: "Set 'active' metadata to 'false'",
          onClick: () => microphone.setActive(false),
        }
      : {
          id: "mic-metadata-true",
          icon: MicrophoneOff,
          buttonClassName: activeButtonStyle,
          hover: "Set 'active' metadata to 'true'",
          onClick: () => microphone.setActive(true),
        },
  ],
  [
    local.video.device.stream
      ? {
          id: "cam-stop",
          icon: Camera,
          buttonClassName: neutralButtonStyle,
          hover: "Turn off the camera",
          onClick: () => local.video.device.stop(),
        }
      : {
          id: "cam-start",
          hover: "Turn on the camera",
          icon: CameraOff,
          buttonClassName: activeButtonStyle,
          onClick: () => local.video.device.start(),
        },
    local.video.device.isEnabled
      ? {
          id: "cam-disable",
          icon: Camera,
          buttonClassName: neutralButtonStyle,
          hover: "Disable the camera stream",
          onClick: () => local.video.device.disable(),
        }
      : {
          id: "cam-enable",
          hover: "Enable the the camera stream",
          icon: CameraOff,
          buttonClassName: activeButtonStyle,
          onClick: () => local.video.device.enable(),
        },
    camera.trackId
      ? {
          id: "cam-remove",
          icon: Camera,
          buttonClassName: neutralButtonStyle,
          hover: "Remove camera track",
          onClick: () => camera.removeTracks(),
        }
      : {
          id: "cam-add",
          icon: CameraOff,
          buttonClassName: activeButtonStyle,
          hover: "Add camera track",
          onClick: () => local.video.device?.stream && camera.addTracks(local.video.device?.stream),
        },
    camera.trackMetadata?.active
      ? {
          id: "cam-metadata-false",
          icon: Camera,
          buttonClassName: neutralButtonStyle,
          hover: "Set 'active' metadata to 'false'",
          onClick: () => camera.setActive(false),
        }
      : {
          id: "cam-metadata-true",
          icon: CameraOff,
          buttonClassName: activeButtonStyle,
          hover: "Set 'active' metadata to 'true'",
          onClick: () => camera.setActive(true),
        },
  ],
  [
    local.screenShare.device.stream
      ? {
          id: "screen-stop",
          icon: Screenshare,
          buttonClassName: neutralButtonStyle,
          hover: "Stop the screensharing",
          hideOnMobile: true,
          onClick: () => local.screenShare.device.stop(),
        }
      : {
          id: "screen-start",
          icon: Screenshare,
          buttonClassName: neutralButtonStyle,
          hover: "Start the screensharing",
          hideOnMobile: true,
          onClick: () => local.screenShare.device.start(),
        },
    local.screenShare.device.isEnabled
      ? {
          id: "screen-disable",
          icon: Screenshare,
          buttonClassName: neutralButtonStyle,
          hover: "Disable screensharing stream",
          hideOnMobile: true,
          onClick: () => local.screenShare.device.disable(),
        }
      : {
          id: "screen-enable",
          icon: Screenshare,
          buttonClassName: neutralButtonStyle,
          hover: "Enable screensharing stream",
          hideOnMobile: true,
          onClick: () => local.screenShare.device.enable(),
        },
    screenShare.trackId
      ? {
          id: "screen-remove",
          icon: Screenshare,
          buttonClassName: neutralButtonStyle,
          hover: "Remove screensharing track",
          hideOnMobile: true,
          onClick: () => screenShare.removeTracks(),
        }
      : {
          id: "screen-add",
          icon: Screenshare,
          buttonClassName: neutralButtonStyle,
          hover: "Add screensharing track",
          hideOnMobile: true,
          onClick: () => local.screenShare.device?.stream && screenShare.addTracks(local.screenShare.device?.stream),
        },
    screenShare.trackMetadata?.active
      ? {
          id: "screen-metadata-false",
          icon: Screenshare,
          buttonClassName: neutralButtonStyle,
          hover: "Set 'active' metadata to 'false'",
          hideOnMobile: true,
          onClick: () => screenShare.setActive(false),
        }
      : {
          id: "screen-metadata-true",
          icon: Screenshare,
          buttonClassName: neutralButtonStyle,
          hover: "Set 'active' metadata to 'true'",
          hideOnMobile: true,
          onClick: () => screenShare.setActive(true),
        },
  ],
  [
    {
      id: "leave-room",
      icon: HangUp,
      hover: "Leave the room",
      buttonClassName: redButtonStyle,
      onClick: () => {
        navigate(`/room/${roomId}`, { state: { isLeavingRoom: true } });
      },
    },
  ],
];

type MediaControlButtonsProps = Sidebar;

const MediaControlButtons: FC<MediaControlButtonsProps> = ({
  openSidebar,
  isSidebarOpen,
}: MediaControlButtonsProps) => {
  const { manualMode } = useDeveloperInfo();
  const mode: StreamingMode = manualMode.status ? "manual" : "automatic";

  const [show, toggleShow] = useToggle(true);
  const streaming = useStreaming();
  const { isSmartphone } = useSmartphoneViewport();
  const { roomId } = useParams();

  const navigate = useNavigate();
  const localPeer = useLocalPeer();

  // todo fix sidebar
  const controls: ControlButton[][] =
    mode === "manual"
      ? getManualControls(streaming, localPeer, navigate, roomId)
      : [
          getAutomaticControls(
            streaming,
            localPeer,
            navigate,
            roomId || null,
            isSidebarOpen,
            openSidebar,
            isSmartphone
          ),
        ];
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
              {group.map(({ hover, onClick, buttonClassName, id, icon, hideOnMobile }) => (
                <MediaControlButton
                  key={id}
                  onClick={onClick}
                  hover={hover}
                  buttonClassName={buttonClassName}
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
