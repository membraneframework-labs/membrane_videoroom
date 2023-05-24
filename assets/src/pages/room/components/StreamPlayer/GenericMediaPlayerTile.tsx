import React, { FC, ForwardedRef, forwardRef } from "react";
import MediaPlayer from "./MediaPlayer";
import clsx from "clsx";

export interface Props {
  video?: MediaStream | null;
  audio?: MediaStream | null;
  flipHorizontally?: boolean;
  layers?: JSX.Element;
  className?: string;
  blockFillContent?: boolean;
}

const GenericMediaPlayerTile = forwardRef<any, Props>(
  ({ video, audio, flipHorizontally, layers, className, blockFillContent }: Props, ref: ForwardedRef<any>) => {
    return (
      <div
        ref={ref}
        data-name="video-feed"
        className={clsx(
          className,
          "relative flex h-full w-full justify-center overflow-hidden",
          "rounded-xl border border-brand-dark-blue-300 bg-gray-900"
        )}
      >
        <MediaPlayer
          videoStream={video || null}
          audioStream={audio || null}
          flipHorizontally={flipHorizontally}
          blockFillContent={blockFillContent}
        />
        {layers}
      </div>
    );
  }
);

export default GenericMediaPlayerTile;
