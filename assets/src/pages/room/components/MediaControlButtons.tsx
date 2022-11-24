import React, { FC } from "react";

import { UseMediaResult } from "../hooks/useMedia";
import MediaControlButton, { MediaControlButtonProps } from "./MediaControlButton";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { MembraneStreaming, StreamingMode } from "../hooks/useMembraneMediaStreaming";

const getControlsAutomatic = (
  userMediaAudio: UseMediaResult,
  audioStreaming: MembraneStreaming,
  userMediaVideo: UseMediaResult,
  cameraStreaming: MembraneStreaming,
  displayMedia: UseMediaResult,
  screenSharingStreaming: MembraneStreaming,
  navigate: NavigateFunction
): MediaControlButtonProps[] => [
  userMediaAudio.isEnabled
    ? {
        icon: "/svg/mic-line.svg",
        hover: "Mute the microphone",
        onClick: () => {
          userMediaAudio.stop();
          audioStreaming.setActive(false);
        },
      }
    : {
        icon: "/svg/mic-off-fill.svg",
        hover: "Unmute the microphone",
        onClick: () => {
          userMediaAudio.start();
          audioStreaming.setActive(true);
        },
      },
  userMediaVideo.isEnabled
    ? {
        icon: "/svg/camera-line.svg",
        hover: "Turn off the camera",
        onClick: () => {
          userMediaVideo.stop();
          cameraStreaming.setActive(false);
        },
      }
    : {
        hover: "Turn on the camera",
        icon: "/svg/camera-off-line.svg",
        onClick: () => {
          userMediaVideo.start();
          cameraStreaming.setActive(true);
        },
      },
  displayMedia.stream
    ? {
        icon: "/svg/computer-line.svg",
        hover: "Stop the screensharing",
        onClick: () => {
          displayMedia.stop();
          screenSharingStreaming.setActive(false);
        },
      }
    : {
        icon: "/svg/computer-line.svg",
        hover: "Start the screensharing",
        onClick: () => {
          displayMedia.start();
          screenSharingStreaming.setActive(true);
        },
      },
  {
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
        icon: "/svg/mic-line.svg",
        hover: "Start the microphone",
        onClick: () => userMediaAudio.stop(),
      }
    : {
        icon: "/svg/mic-off-fill.svg",
        hover: "Stop the microphone",
        onClick: () => userMediaAudio.start(),
      },
  userMediaAudio.isEnabled
    ? {
        icon: "/svg/mic-line.svg",
        hover: "Disable microphone stream",
        onClick: () => userMediaAudio.disable(),
      }
    : {
        icon: "/svg/mic-off-fill.svg",
        hover: "Enable microphone stream",
        onClick: () => userMediaAudio.enable(),
      },
  audioStreaming.tracksId.length !== 0
    ? {
        icon: "/svg/mic-line.svg",
        hover: "Remove microphone track",
        onClick: () => audioStreaming.removeTracks(),
      }
    : {
        icon: "/svg/mic-off-fill.svg",
        hover: "Add microphone track",
        onClick: () => userMediaAudio?.stream && audioStreaming.addTracks(userMediaAudio?.stream),
      },
  audioStreaming.trackMetadata?.active
    ? {
        icon: "/svg/mic-line.svg",
        hover: "Set 'active' metadata to 'false'",
        onClick: () => audioStreaming.setActive(false),
      }
    : {
        icon: "/svg/mic-off-fill.svg",
        hover: "Set 'active' metadata to 'true'",
        onClick: () => audioStreaming.setActive(true),
      },
  userMediaVideo.stream
    ? {
        icon: "/svg/camera-line.svg",
        hover: "Turn off the camera",
        onClick: () => userMediaVideo.stop(),
      }
    : {
        hover: "Turn on the camera",
        icon: "/svg/camera-off-line.svg",
        onClick: () => userMediaVideo.start(),
      },
  userMediaVideo.isEnabled
    ? {
        icon: "/svg/camera-line.svg",
        hover: "Disable the camera stream",
        onClick: () => userMediaVideo.disable(),
      }
    : {
        hover: "Enable the the camera stream",
        icon: "/svg/camera-off-line.svg",
        onClick: () => userMediaVideo.enable(),
      },
  cameraStreaming.tracksId.length !== 0
    ? {
        icon: "/svg/camera-line.svg",
        hover: "Remove camera track",
        onClick: () => cameraStreaming.removeTracks(),
      }
    : {
        icon: "/svg/camera-off-line.svg",
        hover: "Add camera track",
        onClick: () => userMediaVideo?.stream && cameraStreaming.addTracks(userMediaVideo?.stream),
      },
  cameraStreaming.trackMetadata?.active
    ? {
        icon: "/svg/camera-line.svg",
        hover: "Set 'active' metadata to 'false'",
        onClick: () => cameraStreaming.setActive(false),
      }
    : {
        icon: "/svg/camera-off-line.svg",
        hover: "Set 'active' metadata to 'true'",
        onClick: () => cameraStreaming.setActive(true),
      },
  displayMedia.stream
    ? {
        icon: "/svg/computer-line.svg",
        hover: "Stop the screensharing",
        onClick: () => displayMedia.stop(),
      }
    : {
        icon: "/svg/computer-line.svg",
        hover: "Start the screensharing",
        onClick: () => displayMedia.start(),
      },
  displayMedia.isEnabled
    ? {
        icon: "/svg/computer-line.svg",
        hover: "Disable screensharing stream",
        onClick: () => displayMedia.disable(),
      }
    : {
        icon: "/svg/computer-line.svg",
        hover: "Enable screensharing stream",
        onClick: () => displayMedia.enable(),
      },
  screenSharingStreaming.tracksId.length !== 0
    ? {
        icon: "/svg/computer-line.svg",
        hover: "Remove screensharing track",
        onClick: () => screenSharingStreaming.removeTracks(),
      }
    : {
        icon: "/svg/computer-line.svg",
        hover: "Add screensharing track",
        onClick: () => displayMedia?.stream && screenSharingStreaming.addTracks(displayMedia?.stream),
      },
  screenSharingStreaming.trackMetadata?.active
    ? {
        icon: "/svg/computer-line.svg",
        hover: "Set 'active' metadata to 'false'",
        onClick: () => screenSharingStreaming.setActive(false),
      }
    : {
        icon: "/svg/computer-line.svg",
        hover: "Set 'active' metadata to 'true'",
        onClick: () => screenSharingStreaming.setActive(true),
      },
  {
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
  const controls: MediaControlButtonProps[] =
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
      {controls.map(({ icon, hover, onClick, imgClasses }, index) => (
        <MediaControlButton key={index} onClick={onClick} icon={icon} hover={hover} imgClasses={imgClasses} />
      ))}
    </div>
  );
};

export default MediaControlButtons;
