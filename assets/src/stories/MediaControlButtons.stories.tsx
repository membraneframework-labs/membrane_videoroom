import React from "react";
import MediaControlButtons, { LocalUserMediaControls } from "../pages/room/components/MediaControlButtons";
import { UseMediaResult } from "../pages/room/hooks/useMedia";
import { MembraneStreaming } from "../pages/room/hooks/useMembraneMediaStreaming";

export default {
  title: "components/room-page/MediaControlButtons",
  component: MediaControlButtons,
};

const noop = () => undefined;

const DEFAULT_STREAMING: MembraneStreaming = {
  removeTracks: noop,
  addTracks: noop,
  setActive: noop,
  updateTrackMetadata: noop,
  trackId: null,
  trackMetadata: null,
};

const DEFAULT_MEDIA_RESULT: UseMediaResult = {
  isEnabled: true,
  isError: false,
  isSuccess: true,
  start: noop,
  stop: noop,
  enable: noop,
  disable: noop,
};

const DEFAULT_PROPS: LocalUserMediaControls = {
  userMediaVideo: DEFAULT_MEDIA_RESULT,
  cameraStreaming: DEFAULT_STREAMING,
  userMediaAudio: { ...DEFAULT_MEDIA_RESULT, isEnabled: false },
  audioStreaming: DEFAULT_STREAMING,
  displayMedia: DEFAULT_MEDIA_RESULT,
  screenSharingStreaming: DEFAULT_STREAMING,
};
export const Normal = () => {
  return (
    <div className="p-10">
      <MediaControlButtons mode="automatic" {...DEFAULT_PROPS}></MediaControlButtons>
    </div>
  );
};
