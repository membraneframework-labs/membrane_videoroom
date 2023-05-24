import React, { ComponentProps, FC } from "react";
import { SimulcastEncodingToSend } from "./simulcast/SimulcastEncodingToSend";
import { UseSimulcastLocalEncoding, useSimulcastSend } from "../../hooks/useSimulcastSend";
import GenericMediaPlayerTile from "./GenericMediaPlayerTile";

export type Props = {
  showSimulcast: boolean;
} & ComponentProps<typeof GenericMediaPlayerTile>;

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
    <GenericMediaPlayerTile
      data-name="video-feed"
      className={className}
      video={video}
      audio={audio}
      flipHorizontally={flipHorizontally}
      blockFillContent={blockFillContent}
      layers={
        <>
          {layers}
          {showSimulcast && <SimulcastEncodingToSend localEncoding={localEncoding} disabled={!!video} />}
        </>
      }
    />
  );
};

export default LocalMediaPlayerTile;
