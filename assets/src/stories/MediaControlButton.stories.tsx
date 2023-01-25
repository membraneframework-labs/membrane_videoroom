import React from "react";
import Camera from "../features/room-page/icons/Camera";
import HangUp from "../features/room-page/icons/HangUp";
import MediaControlButton from "../pages/room/components/MediaControlButton";

export default {
  title: "components/room-page/MediaControlButton",
  component: MediaControlButton,
};

const neutralButtonStyle = "border-brand-dark-blue-400 text-brand-dark-blue-500 bg-white";
const activeButtonStyle = "text-brand-white bg-brand-dark-blue-400 border-brand-dark-blue-400";
const redButtonStyle = "text-brand-white bg-brand-red border-brand-red";

export const Neutral = () => {
  return (
    <div className="p-10">
      <MediaControlButton
        onClick={() => undefined}
        hover="Turn off the camera"
        icon={Camera}
        className={neutralButtonStyle}
      ></MediaControlButton>
    </div>
  );
};

export const Active = () => {
  return (
    <div className="p-10">
      <MediaControlButton
        onClick={() => undefined}
        hover="Turn on the camera"
        icon={Camera}
        className={activeButtonStyle}
      ></MediaControlButton>
    </div>
  );
};

export const Hangup = () => {
  return (
    <div className="p-10">
      <MediaControlButton
        onClick={() => undefined}
        hover="Leave the room"
        icon={HangUp}
        className={redButtonStyle}
      ></MediaControlButton>
    </div>
  );
};
