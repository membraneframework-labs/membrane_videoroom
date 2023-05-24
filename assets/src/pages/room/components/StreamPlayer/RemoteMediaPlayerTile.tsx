import React, { ComponentProps, FC } from "react";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { useAutomaticEncodingSwitching } from "../../hooks/useAutomaticEncodingSwitching";
import { SimulcastEncodingToReceive } from "./simulcast/SimulcastEncodingToReceive";
import GenericMediaPlayerTile from "./GenericMediaPlayerTile";

export type Props = {
  peerId: string | null;
  remoteTrackId: string | null;
  encodingQuality: TrackEncoding | null;
  showSimulcast: boolean;
  forceEncoding: TrackEncoding | null;
} & ComponentProps<typeof GenericMediaPlayerTile>;

// todo divide to ScreenShare and RemoteTile
const RemoteMediaPlayerTile: FC<Props> = ({
  peerId,
  video,
  audio,
  flipHorizontally,
  remoteTrackId,
  encodingQuality,
  showSimulcast,
  layers,
  className,
  blockFillContent,
  forceEncoding,
}: Props) => {
  const { ref, setTargetEncoding, targetEncoding, smartEncoding, smartEncodingStatus, setSmartEncodingStatus } =
    useAutomaticEncodingSwitching(
      encodingQuality,
      peerId,
      remoteTrackId,
      false, // todo remove
      forceEncoding
    );

  return (
    <GenericMediaPlayerTile
      ref={ref}
      video={video}
      audio={audio}
      flipHorizontally={flipHorizontally}
      blockFillContent={blockFillContent}
      className={className}
      layers={
        <>
          {layers}
          {showSimulcast && (
            <SimulcastEncodingToReceive
              currentEncoding={encodingQuality}
              disabled={!video}
              targetEncoding={targetEncoding || null}
              smartEncoding={smartEncoding}
              localSmartEncodingStatus={smartEncodingStatus}
              setLocalSmartEncodingStatus={setSmartEncodingStatus}
              setTargetEncoding={setTargetEncoding}
            />
          )}
        </>
      }
    />
  );
};

export default RemoteMediaPlayerTile;
