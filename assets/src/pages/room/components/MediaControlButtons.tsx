import React, { FC } from "react";

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
import PhoneCall from "../../../features/room-page/icons/PhoneCall";
import Chat from "../../../features/room-page/icons/Chat";
import useSmartphoneViewport from "../../../features/shared/hooks/useSmartphoneViewport";
import MenuDots from "../../../features/room-page/icons/MenuDots";
import { activeButtonStyle, neutralButtonStyle, redButtonStyle } from "../../../features/room-page/consts";
import { SCREENSHARING_MEDIA_CONSTRAINTS } from "../consts";
import { Device, useLocalPeer } from "../../../features/devices/LocalPeerMediaContext";
import { WebRTCEndpoint } from "@jellyfish-dev/membrane-webrtc-js";

type ControlButton = MediaControlButtonProps & { id: string };

const getAutomaticControls = (
  { audioStreaming, cameraStreaming, screenSharingStreaming, isSidebarOpen, openSidebar, webrtc }: LocalUserMediaControls,
  navigate: NavigateFunction,
  roomId: string | null,
  videoDevice: Device,
  audioDevice: Device,
  screenSharingDevice: Device,
  setScreenSharingConfig: (constraints: MediaStreamConstraints | null) => void,
  isMobileViewport?: boolean
): ControlButton[] => [
    {
      id: "phone-call",
      icon: PhoneCall,
      hover: "Call phone",
      buttonClassName: neutralButtonStyle,
      // buttonClassName: redButtonStyle,
      onClick: () => {
        console.log("Send event")
        const phoneNumber = "1234"
        const mediaEvent = { type: "SIP-Event", phoneNumber: phoneNumber }
        webrtc?.emit("sendMediaEvent", JSON.stringify(mediaEvent))
        console.log("Call someone")
      },
    },
    videoDevice.isEnabled
      ? {
        id: "cam-off",
        icon: Camera,
        hover: "Turn off the camera",
        buttonClassName: neutralButtonStyle,
        onClick: () => {
          videoDevice.disable();
          cameraStreaming.setActive(false);
        },
      }
      : {
        id: "cam-on",
        hover: "Turn on the camera",
        icon: CameraOff,
        buttonClassName: activeButtonStyle,
        onClick: () => {
          if (videoDevice.stream) {
            videoDevice.enable();
          } else {
            videoDevice.start();
          }
          cameraStreaming.setActive(true);
        },
      },
    audioDevice.isEnabled
      ? {
        id: "mic-mute",
        icon: Microphone,
        hover: "Turn off the microphone",
        buttonClassName: neutralButtonStyle,
        onClick: () => {
          audioDevice.disable();
          audioStreaming.setActive(false);
        },
      }
      : {
        id: "mic-unmute",
        icon: MicrophoneOff,
        hover: "Turn on the microphone",
        buttonClassName: activeButtonStyle,
        onClick: () => {
          if (audioDevice.stream) {
            audioDevice.enable();
          } else {
            audioDevice.start();
          }
          audioStreaming.setActive(true);
        },
      },
    screenSharingDevice.stream
      ? {
        id: "screenshare-stop",
        icon: Screenshare,
        hover: "Stop sharing your screen",
        buttonClassName: neutralButtonStyle,
        hideOnMobile: true,
        onClick: () => {
          setScreenSharingConfig(null);
          screenSharingStreaming.setActive(false);
        },
      }
      : {
        id: "screenshare-start",
        icon: Screenshare,
        hover: "Share your screen",
        buttonClassName: neutralButtonStyle,
        hideOnMobile: true,
        onClick: () => {
          setScreenSharingConfig(SCREENSHARING_MEDIA_CONSTRAINTS);
          screenSharingStreaming.setActive(true);
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
          buttonClassName: neutralButtonStyle,
          hover: "Start the microphone",
          onClick: () => userMediaAudio.stop(),
        }
        : {
          id: "mic-start",
          icon: MicrophoneOff,
          buttonClassName: activeButtonStyle,
          hover: "Stop the microphone",
          onClick: () => userMediaAudio.start(),
        },
      userMediaAudio.isEnabled
        ? {
          id: "mic-disable",
          icon: Microphone,
          buttonClassName: neutralButtonStyle,
          hover: "Disable microphone stream",
          onClick: () => userMediaAudio.disable(),
        }
        : {
          id: "mic-enable",
          icon: MicrophoneOff,
          buttonClassName: activeButtonStyle,
          hover: "Enable microphone stream",
          onClick: () => userMediaAudio.enable(),
        },
      audioStreaming.trackId
        ? {
          id: "mic-remove",
          icon: Microphone,
          buttonClassName: neutralButtonStyle,
          hover: "Remove microphone track",
          onClick: () => audioStreaming.removeTracks(),
        }
        : {
          id: "mic-add",
          icon: MicrophoneOff,
          buttonClassName: activeButtonStyle,
          hover: "Add microphone track",
          onClick: () => userMediaAudio?.stream && audioStreaming.addTracks(userMediaAudio?.stream),
        },
      audioStreaming.trackMetadata?.active
        ? {
          id: "mic-metadata-false",
          icon: Microphone,
          buttonClassName: neutralButtonStyle,
          hover: "Set 'active' metadata to 'false'",
          onClick: () => audioStreaming.setActive(false),
        }
        : {
          id: "mic-metadata-true",
          icon: MicrophoneOff,
          buttonClassName: activeButtonStyle,
          hover: "Set 'active' metadata to 'true'",
          onClick: () => audioStreaming.setActive(true),
        },
    ],
    [
      userMediaVideo.stream
        ? {
          id: "cam-stop",
          icon: Camera,
          buttonClassName: neutralButtonStyle,
          hover: "Turn off the camera",
          onClick: () => userMediaVideo.stop(),
        }
        : {
          id: "cam-start",
          hover: "Turn on the camera",
          icon: CameraOff,
          buttonClassName: activeButtonStyle,
          onClick: () => userMediaVideo.start(),
        },
      userMediaVideo.isEnabled
        ? {
          id: "cam-disable",
          icon: Camera,
          buttonClassName: neutralButtonStyle,
          hover: "Disable the camera stream",
          onClick: () => userMediaVideo.disable(),
        }
        : {
          id: "cam-enable",
          hover: "Enable the the camera stream",
          icon: CameraOff,
          buttonClassName: activeButtonStyle,
          onClick: () => userMediaVideo.enable(),
        },
      cameraStreaming.trackId
        ? {
          id: "cam-remove",
          icon: Camera,
          buttonClassName: neutralButtonStyle,
          hover: "Remove camera track",
          onClick: () => cameraStreaming.removeTracks(),
        }
        : {
          id: "cam-add",
          icon: CameraOff,
          buttonClassName: activeButtonStyle,
          hover: "Add camera track",
          onClick: () => userMediaVideo?.stream && cameraStreaming.addTracks(userMediaVideo?.stream),
        },
      cameraStreaming.trackMetadata?.active
        ? {
          id: "cam-metadata-false",
          icon: Camera,
          buttonClassName: neutralButtonStyle,
          hover: "Set 'active' metadata to 'false'",
          onClick: () => cameraStreaming.setActive(false),
        }
        : {
          id: "cam-metadata-true",
          icon: CameraOff,
          buttonClassName: activeButtonStyle,
          hover: "Set 'active' metadata to 'true'",
          onClick: () => cameraStreaming.setActive(true),
        },
    ],
    [
      displayMedia.stream
        ? {
          id: "screen-stop",
          icon: Screenshare,
          buttonClassName: neutralButtonStyle,
          hover: "Stop the screensharing",
          hideOnMobile: true,
          onClick: () => displayMedia.stop(),
        }
        : {
          id: "screen-start",
          icon: Screenshare,
          buttonClassName: neutralButtonStyle,
          hover: "Start the screensharing",
          hideOnMobile: true,
          onClick: () => displayMedia.start(),
        },
      displayMedia.isEnabled
        ? {
          id: "screen-disable",
          icon: Screenshare,
          buttonClassName: neutralButtonStyle,
          hover: "Disable screensharing stream",
          hideOnMobile: true,
          onClick: () => displayMedia.disable(),
        }
        : {
          id: "screen-enable",
          icon: Screenshare,
          buttonClassName: neutralButtonStyle,
          hover: "Enable screensharing stream",
          hideOnMobile: true,
          onClick: () => displayMedia.enable(),
        },
      screenSharingStreaming.trackId
        ? {
          id: "screen-remove",
          icon: Screenshare,
          buttonClassName: neutralButtonStyle,
          hover: "Remove screensharing track",
          hideOnMobile: true,
          onClick: () => screenSharingStreaming.removeTracks(),
        }
        : {
          id: "screen-add",
          icon: Screenshare,
          buttonClassName: neutralButtonStyle,
          hover: "Add screensharing track",
          hideOnMobile: true,
          onClick: () => displayMedia?.stream && screenSharingStreaming.addTracks(displayMedia?.stream),
        },
      screenSharingStreaming.trackMetadata?.active
        ? {
          id: "screen-metadata-false",
          icon: Screenshare,
          buttonClassName: neutralButtonStyle,
          hover: "Set 'active' metadata to 'false'",
          hideOnMobile: true,
          onClick: () => screenSharingStreaming.setActive(false),
        }
        : {
          id: "screen-metadata-true",
          icon: Screenshare,
          buttonClassName: neutralButtonStyle,
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
        buttonClassName: redButtonStyle,
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
  userMediaVideo: Device;
  cameraStreaming: MembraneStreaming;
  userMediaAudio: Device;
  audioStreaming: MembraneStreaming;
  displayMedia: Device;
  screenSharingStreaming: MembraneStreaming;
  isSidebarOpen?: boolean;
  openSidebar: () => void;
  webrtc: WebRTCEndpoint | undefined;
};

const MediaControlButtons: FC<Props> = (props: Props) => {
  const [show, toggleShow] = useToggle(true);
  const { isSmartphone } = useSmartphoneViewport();
  const { roomId } = useParams();

  const navigate = useNavigate();

  const { audio, video, screenShare } = useLocalPeer();

  const controls: ControlButton[][] =
    props.mode === "manual"
      ? getManualControls(props, navigate, roomId)
      : [
        getAutomaticControls(
          props,
          navigate,
          roomId || null,
          video.device,
          audio.device,
          screenShare.device,
          screenShare.setConfig,
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
