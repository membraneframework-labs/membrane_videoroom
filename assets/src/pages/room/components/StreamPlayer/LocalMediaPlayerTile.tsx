import React, { FC } from "react";
import MediaPlayer from "./MediaPlayer";
import { SimulcastEncodingToSend } from "./simulcast/SimulcastEncodingToSend";
import { UseSimulcastLocalEncoding, useSimulcastSend } from "../../hooks/useSimulcastSend";
import clsx from "clsx";

export interface Props {
  peerId?: string;
  video: MediaStream | null;
  flipHorizontally?: boolean; // always true
  audio: MediaStream | null; // always false
  showSimulcast?: boolean;
  layers?: JSX.Element;
  className?: string;
  blockFillContent?: boolean;
}

const LocalMediaPlayerTile: FC<Props> = ({
  video,
  audio,
  flipHorizontally,
  showSimulcast,
  layers,
  className,
  blockFillContent,
}: Props) => {
  const localEncoding: UseSimulcastLocalEncoding = useSimulcastSend();

  return (
    <div
      data-name="video-feed"
      className={clsx(
        className,
        "relative flex h-full w-full justify-center overflow-hidden",
        "rounded-xl border border-brand-dark-blue-300 bg-gray-900"
      )}
    >
      <MediaPlayer
        videoStream={video}
        audioStream={audio}
        flipHorizontally={flipHorizontally}
        blockFillContent={blockFillContent}
      />
      {layers}
      {showSimulcast && <SimulcastEncodingToSend localEncoding={localEncoding} disabled={!!video} />}
    </div>
  );
};

export default LocalMediaPlayerTile;
