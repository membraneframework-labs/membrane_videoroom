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
import {
  activeButtonManualStyle,
  activeButtonStyle,
  neutralButtonManualStyle,
  neutralButtonStyle,
  redButtonStyle,
} from "../../../features/room-page/consts";

type ControlButton = MediaControlButtonProps & { id: string };

const getAutomaticControls = (
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
  //TODO enable when chat is implemented
  // {
  //   id: "chat",
  //   icon: Chat,
  //   hover: "Open the chat",
  //   className: neutralButtonStyle,
  //   onClick: () => undefined,
  // },
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
const streamStop = " bg-indigo-100";
const streamStart = " bg-indigo-100";
const trackDisable = " bg-yellow-100";
const trackEnable = " bg-yellow-700";
const trackRemove = " bg-pink-100";
const trackAdd = " bg-pink-700";
const trackNullify = " bg-green-100";
const trackNullifyRevert = " bg-green-700";
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
          className: neutralButtonManualStyle + streamStop,
          hover: "Start the microphone",
          onClick: () => userMediaAudio.stop(),
        }
      : {
          id: "mic-start",
          icon: MicrophoneOff,
          className: activeButtonManualStyle + streamStart,
          hover: "Stop the microphone",
          onClick: () => userMediaAudio.start(),
        },
    userMediaAudio.isEnabled
      ? {
          id: "mic-disable",
          icon: Microphone,
          className: neutralButtonManualStyle + trackDisable,
          hover: "Disable microphone stream",
          onClick: () => userMediaAudio.disable(),
        }
      : {
          id: "mic-enable",
          icon: MicrophoneOff,
          className: activeButtonManualStyle + trackEnable,
          hover: "Enable microphone stream",
          onClick: () => userMediaAudio.enable(),
        },
    audioStreaming.trackId
      ? {
          id: "mic-remove",
          icon: Microphone,
          className: neutralButtonManualStyle + trackRemove,
          hover: "Remove microphone track",
          onClick: () => audioStreaming.removeTracks(),
        }
      : {
          id: "mic-add",
          icon: MicrophoneOff,
          className: activeButtonManualStyle + trackAdd,
          hover: "Add microphone track",
          onClick: () => userMediaAudio?.stream && audioStreaming.addTracks(userMediaAudio?.stream),
        },
    audioStreaming.track
      ? {
          id: "mic-nullify-mock",
          icon: Microphone,
          className: neutralButtonManualStyle + trackNullify,
          hover: "Nullify mic track",
          onClick: () => audioStreaming.replaceTrackTrack(null),
        }
      : {
          id: "mic-nullify-revert",
          icon: MicrophoneOff,
          className: activeButtonManualStyle + "  bg-green-700",
          hover: "Revert track mic track",
          onClick: () => {
            const track = userMediaAudio?.stream?.getVideoTracks()[0] || null;
            if (!track) {
              console.log("skipped");
            }
            audioStreaming.replaceTrackTrack(track);
          },
        },
    audioStreaming.trackId && (audioStreaming.currentMode === "CAMERA" || audioStreaming.currentMode === "NULL")
      ? {
          id: "mic-set-canvas",
          icon: Microphone,
          className: neutralButtonManualStyle + streamStop,
          hover: "Set canvas as mic track",
          onClick: () => audioStreaming.replaceTrackTrack("MOCK"),
        }
      : {
          id: "mic-set-canvas-revert",
          icon: MicrophoneOff,
          className: activeButtonManualStyle + streamStop,
          hover: "Revert mic track",
          onClick: () => {
            const track = userMediaAudio?.stream?.getVideoTracks()[0] || null;
            if (!track) {
              console.log("skipped");
            }
            audioStreaming.replaceTrackTrack(track);
          },
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
          className: neutralButtonManualStyle + streamStop,
          hover: "Turn off the camera",
          onClick: () => userMediaVideo.stop(),
        }
      : {
          id: "cam-start",
          hover: "Turn on the camera",
          icon: CameraOff,
          className: activeButtonStyle + streamStart,
          onClick: () => userMediaVideo.start(),
        },
    userMediaVideo.isEnabled
      ? {
          id: "cam-disable",
          icon: Camera,
          className: neutralButtonManualStyle + trackDisable,
          hover: "Disable the camera stream",
          onClick: () => userMediaVideo.disable(),
        }
      : {
          id: "cam-enable",
          hover: "Enable the the camera stream",
          icon: CameraOff,
          className: activeButtonStyle + trackEnable,
          onClick: () => userMediaVideo.enable(),
        },
    cameraStreaming.trackId
      ? {
          id: "cam-remove",
          icon: Camera,
          className: neutralButtonManualStyle + trackRemove,
          hover: "Remove camera track",
          onClick: () => cameraStreaming.removeTracks(),
        }
      : {
          id: "cam-add",
          icon: CameraOff,
          className: activeButtonManualStyle + trackAdd,
          hover: "Add camera track",
          onClick: () => userMediaVideo?.stream && cameraStreaming.addTracks(userMediaVideo?.stream),
        },
    cameraStreaming.track
      ? {
          id: "cam-nullify-mock",
          icon: Camera,
          className: neutralButtonManualStyle + trackNullify,
          hover: "Nullify cam track",
          onClick: () => cameraStreaming.replaceTrackTrack(null),
        }
      : {
          id: "cam-nullify-revert",
          icon: CameraOff,
          className: activeButtonManualStyle + trackNullifyRevert,
          hover: "Revert cam track",
          onClick: () => {
            const track = userMediaVideo?.stream?.getVideoTracks()[0] || null;
            if (!track) {
              console.log("skipped");
            }
            cameraStreaming.replaceTrackTrack(track);
          },
        },
    cameraStreaming.trackId && (cameraStreaming.currentMode === "CAMERA" || cameraStreaming.currentMode === "NULL")
      ? {
          id: "cam-set-canvas",
          icon: Camera,
          className: neutralButtonManualStyle + streamStop,
          hover: "Set canvas as cam track",
          onClick: () => cameraStreaming.replaceTrackTrack("MOCK"),
        }
      : {
          id: "cam-set-canvas-revert",
          icon: CameraOff,
          className: activeButtonManualStyle + streamStop,
          hover: "Revert cam track",
          onClick: () => {
            const track = userMediaVideo?.stream?.getVideoTracks()[0] || null;
            if (!track) {
              console.log("skipped");
            }
            cameraStreaming.replaceTrackTrack(track);
          },
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
          className: neutralButtonManualStyle + streamStop,
          hover: "Stop the screensharing",
          hideOnMobile: true,
          onClick: () => displayMedia.stop(),
        }
      : {
          id: "screen-start",
          icon: Screenshare,
          className: activeButtonManualStyle + streamStart,
          hover: "Start the screensharing",
          hideOnMobile: true,
          onClick: () => displayMedia.start(),
        },
    displayMedia.isEnabled
      ? {
          id: "screen-disable",
          icon: Screenshare,
          className: neutralButtonManualStyle + trackEnable,
          hover: "Disable screensharing stream",
          hideOnMobile: true,
          onClick: () => displayMedia.disable(),
        }
      : {
          id: "screen-enable",
          icon: Screenshare,
          className: activeButtonManualStyle + trackDisable,
          hover: "Enable screensharing stream",
          hideOnMobile: true,
          onClick: () => displayMedia.enable(),
        },
    screenSharingStreaming.trackId
      ? {
          id: "screen-remove",
          icon: Screenshare,
          className: neutralButtonManualStyle + trackRemove,
          hover: "Remove screensharing track",
          hideOnMobile: true,
          onClick: () => screenSharingStreaming.removeTracks(),
        }
      : {
          id: "screen-add",
          icon: Screenshare,
          className: activeButtonManualStyle + trackAdd,
          hover: "Add screensharing track",
          hideOnMobile: true,
          onClick: () => displayMedia?.stream && screenSharingStreaming.addTracks(displayMedia?.stream),
        },
    screenSharingStreaming.trackMetadata?.active
      ? {
          id: "screen-metadata-false",
          icon: Screenshare,
          className: neutralButtonManualStyle,
          hover: "Set 'active' metadata to 'false'",
          hideOnMobile: true,
          onClick: () => screenSharingStreaming.setActive(false),
        }
      : {
          id: "screen-metadata-true",
          icon: Screenshare,
          className: neutralButtonManualStyle,
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
};

const MediaControlButtons: FC<Props> = (props: Props) => {
  const [show, toggleShow] = useToggle(true);
  const { roomId } = useParams();

  const navigate = useNavigate();

  const controls: ControlButton[][] =
    props.mode === "manual"
      ? getManualControls(props, navigate, roomId)
      : [getAutomaticControls(props, navigate, roomId)];
  return (
    <div>
      <div
        onClick={toggleShow}
        className="absolute left-1/2 top-[-15px] z-[-10] h-[15px] w-[50px] -translate-x-1/2 rounded-t-lg hover:bg-gray-700 hover:bg-opacity-90"
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
