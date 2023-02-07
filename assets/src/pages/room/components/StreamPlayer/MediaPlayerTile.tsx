import type { FC } from "react";
import React from "react";
import MediaPlayer from "./MediaPlayer";
import clsx from "clsx";

export interface Props {
  videoStream?: MediaStream;
  audioStream?: MediaStream;
  flipHorizontally?: boolean;
  playAudio?: boolean;
  layers?: JSX.Element;
  className?: string;
  blockFillContent?: boolean;
}

const MediaPlayerTile: FC<Props> = ({
  playAudio,
  videoStream,
  flipHorizontally,
  audioStream,
  layers,
  className,
  blockFillContent,
}: Props) => {
  return (
    <div
      data-name="video-feed"
      className={clsx(
        className,
        "relative flex h-full w-full justify-center overflow-hidden rounded-xl border border-brand-dark-blue-300 bg-gray-900"
      )}
    >
      <MediaPlayer
        videoStream={videoStream}
        audioStream={audioStream}
        flipHorizontally={flipHorizontally}
        playAudio={playAudio}
        blockFillContent={blockFillContent}
      />
      {layers}
    </div>
  );
};

export default MediaPlayerTile;
