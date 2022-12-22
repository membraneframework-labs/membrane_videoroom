import React, { FC } from "react";

import { UseMediaResult } from "../hooks/useMedia";
import MediaControlButton, { MediaControlButtonProps } from "./MediaControlButton";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { MembraneStreaming, StreamingMode } from "../hooks/useMembraneMediaStreaming";

type ControlButton = MediaControlButtonProps & { id: string };

const getControlsAutomatic = (
  userMediaAudio: UseMediaResult,
  audioStreaming: MembraneStreaming,
  userMediaVideo: UseMediaResult,
  cameraStreaming: MembraneStreaming,
  displayMedia: UseMediaResult,
  screenSharingStreaming: MembraneStreaming,
  navigate: NavigateFunction
): ControlButton[] => [
  userMediaAudio.isEnabled
    ? {
        id: "mic-mute",
        icon: "/svg/mic-line.svg",
        hover: "Mute the microphone",
        onClick: () => {
          userMediaAudio.disable();
          audioStreaming.setActive(false);
        },
      }
    : {
        id: "mic-unmute",
        icon: "/svg/mic-off-fill.svg",
        hover: "Unmute the microphone",
        onClick: () => {
          if (userMediaAudio.stream) {
            userMediaAudio.enable();
          } else {
            userMediaAudio.start();
          }
          audioStreaming.setActive(true);
        },
      },
  userMediaVideo.isEnabled
    ? {
        id: "cam-off",
        icon: "/svg/camera-line.svg",
        hover: "Turn off the camera",
        onClick: () => {
          userMediaVideo.disable();
          cameraStreaming.setActive(false);
        },
      }
    : {
        id: "cam-on",
        hover: "Turn on the camera",
        icon: "/svg/camera-off-line.svg",
        onClick: () => {
          if (userMediaVideo.stream) {
            userMediaVideo.enable();
          } else {
            userMediaVideo.start();
          }
          cameraStreaming.setActive(true);
        },
      },
  displayMedia.stream
    ? {
        id: "stream-stop",
        icon: "/svg/computer-line.svg",
        hover: "Stop the screensharing",
        onClick: () => {
          displayMedia.stop();
          screenSharingStreaming.setActive(false);
        },
      }
    : {
        id: "stream-start",
        icon: "/svg/computer-line.svg",
        hover: "Start the screensharing",
        onClick: () => {
          displayMedia.start();
          screenSharingStreaming.setActive(true);
        },
      },
  {
    id: "leave-room",
    icon: "/svg/phone-fill.svg",
    hover: "Leave the room",
    imgClasses: "black-to-red transform rotate-135",
    onClick: () => {
      navigate("/");
    },
  },
];

const getManualControls = (
  userMediaAudio: UseMediaResult,
  audioStreaming: MembraneStreaming,
  userMediaVideo: UseMediaResult,
  cameraStreaming: MembraneStreaming,
  displayMedia: UseMediaResult,
  screenSharingStreaming: MembraneStreaming,
  navigate: NavigateFunction
) => [
  userMediaAudio.stream
    ? {
        id: "mic-stop",
        icon: "/svg/mic-line.svg",
        hover: "Stop the microphone",
        onClick: () => userMediaAudio.stop(),
      }
    : {
        id: "mic-start",
        icon: "/svg/mic-off-fill.svg",
        hover: "Start the microphone",
        onClick: () => userMediaAudio.start(),
      },
  userMediaAudio.isEnabled
    ? {
        id: "mic-disable",
        icon: "/svg/mic-line.svg",
        hover: "Disable microphone stream",
        onClick: () => userMediaAudio.disable(),
      }
    : {
        id: "mic-enable",
        icon: "/svg/mic-off-fill.svg",
        hover: "Enable microphone stream",
        onClick: () => userMediaAudio.enable(),
      },
  audioStreaming.trackId
    ? {
        id: "mic-remove",
        icon: "/svg/mic-line.svg",
        hover: "Remove microphone track",
        onClick: () => audioStreaming.removeTracks(),
      }
    : {
        id: "mic-add",
        icon: "/svg/mic-off-fill.svg",
        hover: "Add microphone track",
        onClick: () => userMediaAudio?.stream && audioStreaming.addTracks(userMediaAudio?.stream),
      },
  audioStreaming.trackMetadata?.active
    ? {
        id: "mic-metadata-false",
        icon: "/svg/mic-line.svg",
        hover: "Set 'active' metadata to 'false'",
        onClick: () => audioStreaming.setActive(false),
      }
    : {
        id: "mic-metadata-true",
        icon: "/svg/mic-off-fill.svg",
        hover: "Set 'active' metadata to 'true'",
        onClick: () => audioStreaming.setActive(true),
      },
  userMediaVideo.stream
    ? {
        id: "cam-off",
        icon: "/svg/camera-line.svg",
        hover: "Turn off the camera",
        onClick: () => userMediaVideo.stop(),
      }
    : {
        id: "cam-on",
        hover: "Turn on the camera",
        icon: "/svg/camera-off-line.svg",
        onClick: () => userMediaVideo.start(),
      },
  userMediaVideo.isEnabled
    ? {
        id: "cam-disable",
        icon: "/svg/camera-line.svg",
        hover: "Disable the camera stream",
        onClick: () => userMediaVideo.disable(),
      }
    : {
        id: "cam-enable",
        hover: "Enable the the camera stream",
        icon: "/svg/camera-off-line.svg",
        onClick: () => userMediaVideo.enable(),
      },
  cameraStreaming.trackId
    ? {
        id: "cam-remove",
        icon: "/svg/camera-line.svg",
        hover: "Remove camera track",
        onClick: () => cameraStreaming.removeTracks(),
      }
    : {
        id: "cam-add",
        icon: "/svg/camera-off-line.svg",
        hover: "Add camera track",
        onClick: () => userMediaVideo?.stream && cameraStreaming.addTracks(userMediaVideo?.stream),
      },
  cameraStreaming.trackMetadata?.active
    ? {
        id: "cam-metadata-false",
        icon: "/svg/camera-line.svg",
        hover: "Set 'active' metadata to 'false'",
        onClick: () => cameraStreaming.setActive(false),
      }
    : {
        id: "cam-metadata-true",
        icon: "/svg/camera-off-line.svg",
        hover: "Set 'active' metadata to 'true'",
        onClick: () => cameraStreaming.setActive(true),
      },
  displayMedia.stream
    ? {
        id: "screen-stop",
        icon: "/svg/computer-line.svg",
        hover: "Stop the screensharing",
        onClick: () => displayMedia.stop(),
      }
    : {
        id: "screen-start",
        icon: "/svg/computer-line.svg",
        hover: "Start the screensharing",
        onClick: () => displayMedia.start(),
      },
  displayMedia.isEnabled
    ? {
        id: "screen-disable",
        icon: "/svg/computer-line.svg",
        hover: "Disable screensharing stream",
        onClick: () => displayMedia.disable(),
      }
    : {
        id: "screen-enable",
        icon: "/svg/computer-line.svg",
        hover: "Enable screensharing stream",
        onClick: () => displayMedia.enable(),
      },
  screenSharingStreaming.trackId
    ? {
        id: "screen-remove",
        icon: "/svg/computer-line.svg",
        hover: "Remove screensharing track",
        onClick: () => screenSharingStreaming.removeTracks(),
      }
    : {
        id: "screen-add",
        icon: "/svg/computer-line.svg",
        hover: "Add screensharing track",
        onClick: () => displayMedia?.stream && screenSharingStreaming.addTracks(displayMedia?.stream),
      },
  screenSharingStreaming.trackMetadata?.active
    ? {
        id: "screen-metadata-false",
        icon: "/svg/computer-line.svg",
        hover: "Set 'active' metadata to 'false'",
        onClick: () => screenSharingStreaming.setActive(false),
      }
    : {
        id: "screen-metadata-true",
        icon: "/svg/computer-line.svg",
        hover: "Set 'active' metadata to 'true'",
        onClick: () => screenSharingStreaming.setActive(true),
      },
  {
    id: "leave",
    icon: "/svg/phone-fill.svg",
    hover: "Leave the room",
    imgClasses: "black-to-red transform rotate-135",
    onClick: () => {
      navigate("/");
    },
  },
];

type Props = {
  mode: StreamingMode;
  userMediaVideo: UseMediaResult;
  cameraStreaming: MembraneStreaming;
  userMediaAudio: UseMediaResult;
  audioStreaming: MembraneStreaming;
  displayMedia: UseMediaResult;
  screenSharingStreaming: MembraneStreaming;
};

const MediaControlButtons: FC<Props> = ({
  mode,
  userMediaAudio,
  audioStreaming,
  userMediaVideo,
  cameraStreaming,
  displayMedia,
  screenSharingStreaming,
}: Props) => {
  const navigate = useNavigate();
  const controls: ControlButton[] =
    mode === "manual"
      ? getManualControls(
          userMediaAudio,
          audioStreaming,
          userMediaVideo,
          cameraStreaming,
          displayMedia,
          screenSharingStreaming,
          navigate
        )
      : getControlsAutomatic(
          userMediaAudio,
          audioStreaming,
          userMediaVideo,
          cameraStreaming,
          displayMedia,
          screenSharingStreaming,
          navigate
        );

  return (
    <div
      id="controls"
      className="flex-none flex justify-center absolute mb-16 md:mb-0 inset-x-0 bottom-0 p-2 rounded-md"
    >
      {controls.map(({ icon, hover, onClick, imgClasses, id }) => (
        <MediaControlButton key={id} onClick={onClick} icon={icon} hover={hover} imgClasses={imgClasses} />
      ))}
    </div>
  );
};

export default MediaControlButtons;
