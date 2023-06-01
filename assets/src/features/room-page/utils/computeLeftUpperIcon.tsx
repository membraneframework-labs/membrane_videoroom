import React from "react";
import { MediaPlayerTileConfig } from "../../../pages/types";
import { DisabledMicIcon, isLoading, showDisabledIcon } from "../components/DisabledTrackIcon";
import SoundIcon from "../components/SoundIcon";

export const getTileUpperLeftIcon = (config: MediaPlayerTileConfig): JSX.Element | null => {
  if (config.typeName !== "local" && config.typeName !== "remote") return null;

  if (showDisabledIcon(config.audio)) return <DisabledMicIcon isLoading={isLoading(config.audio)} />;

  return <SoundIcon visible={config.isSpeaking} />;
};
