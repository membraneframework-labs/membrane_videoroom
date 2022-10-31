import React, { FC } from "react";

import { UseMediaResult } from "../hooks/useUserMedia";
import MediaControlButton, { MediaControlButtonProps } from "./MediaControlButton";
import {NavigateFunction, useNavigate} from "react-router-dom";

const getControls = (
  userMediaAudio: UseMediaResult,
  userMediaVideo: UseMediaResult,
  displayMedia: UseMediaResult,
  navigate: NavigateFunction
) => [
  userMediaAudio.stream
    ? {
        icon: "/svg/mic-line.svg",
        hover: "Mute the microphone",
        onClick: () => {
          userMediaAudio.stop();
        },
      }
    : {
        icon: "/svg/mic-off-fill.svg",
        hover: "Unmute the microphone",
        onClick: () => {
          userMediaAudio.start();
        },
      },
  userMediaVideo.stream
    ? {
        icon: "/svg/camera-line.svg",
        hover: "Turn off the camera",
        onClick: () => {
          userMediaVideo.stop();
        },
      }
    : {
        hover: "Turn on the camera",
        icon: "/svg/camera-off-line.svg",
        onClick: () => {
          userMediaVideo.start();
        },
      },
  displayMedia.stream
    ? {
        icon: "/svg/computer-line.svg",
        hover: "Stop the screensharing",
        onClick: () => {
          displayMedia.stop();
        },
      }
    : {
        icon: "/svg/computer-line.svg",
        hover: "Start the screensharing",
        onClick: () => {
          displayMedia.start();
        },
      },
  {
    icon: "/svg/phone-fill.svg",
    hover: "Leave the room",
    imgClasses: "black-to-red transform rotate-135",
    onClick: () => {
      navigate("/")
    },
  },
];

type Props = {
  userMediaAudio: UseMediaResult;
  userMediaVideo: UseMediaResult;
  displayMedia: UseMediaResult;
};

const MediaControlButtons: FC<Props> = ({ userMediaAudio, userMediaVideo, displayMedia }: Props) => {
    const navigate = useNavigate();
    const controls: MediaControlButtonProps[] = getControls(userMediaAudio, userMediaVideo, displayMedia, navigate);

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
