import React, { FC } from "react";

import { UseMediaResult } from "../hooks/useUserMedia";
import MediaControlButton, { MediaControlButtonProps } from "./MediaControlButton";

const getControls = (userMediaAudio: UseMediaResult, userMediaVideo: UseMediaResult, displayMedia: UseMediaResult) => [
  userMediaAudio.stream
    ? {
        icon: "/svg/mic-line.svg",
        hover: "Mute or unmute the microphone",
        onClick: () => {
          console.log("Stopping mic...");
          userMediaAudio.stop();
        },
      }
    : {
        icon: "/svg/mic-off-fill.svg",
        hover: "Mute or unmute the microphone",
        onClick: () => {
          console.log("Starting mic...");
          userMediaAudio.start();
        },
      },
  userMediaVideo.stream
    ? {
        icon: "/svg/camera-line.svg",
        hover: "Turn on/off the camera",
        onClick: () => {
          console.log("Stopping camera...");
          userMediaVideo.stop();
          // todo remove stream
        },
      }
    : {
        hover: "Turn on/off the camera",
        icon: "/svg/camera-off-line.svg",
        onClick: () => {
          console.log("Starting camera...");
          userMediaVideo.start();
        },
      },
  displayMedia.stream
    ? {
        icon: "/svg/computer-line.svg",
        hover: "Start or stop the screensharing",
        onClick: () => {
          console.log("Stopping ScreenSharing...");
          displayMedia.stop();
        },
      }
    : {
        icon: "/svg/computer-line.svg",
        hover: "Start or stop the screensharing",
        onClick: () => {
          console.log("Starting ScreenSharing...");
          displayMedia.start();
        },
      },
  {
    icon: "/svg/phone-fill.svg",
    hover: "Leave button",
    imgClasses: "black-to-red transform rotate-135",
    onClick: () => {
      console.log("Leaving...");
    },
  },
];

type Props = {
  userMediaAudio: UseMediaResult;
  userMediaVideo: UseMediaResult;
  displayMedia: UseMediaResult;
};

const MediaControlButtons: FC<Props> = ({ userMediaAudio, userMediaVideo, displayMedia }: Props) => {
  const controls: MediaControlButtonProps[] = getControls(userMediaAudio, userMediaVideo, displayMedia);

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
