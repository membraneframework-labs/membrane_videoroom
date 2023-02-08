import React from "react";
import MicrophoneOff from "../icons/MicrophoneOff";
import { TrackWithId } from "../../../pages/types";

type DisabledMicIconProps = {
  isLoading: boolean;
};

export const DisabledMicIcon = ({ isLoading }: DisabledMicIconProps) => {
  return (
    <div className="flex h-8 w-8 flex-wrap content-center justify-center rounded-full bg-white">
      <MicrophoneOff className={isLoading ? "animate-spin" : ""} fill="#001A72" />
    </div>
  );
};

export const isLoading = (track: TrackWithId | null) =>
  track !== null && track?.stream === undefined && track?.metadata?.active === true;
export const showDisabledIcon = (track: TrackWithId | null) =>
  (track !== null && track?.stream === undefined) || track?.metadata?.active === false;
