import React, { FC } from "react";
import MediaPlayer from "./MediaPlayer";
import { SimulcastEncodingToSend } from "./simulcast/SimulcastEncodingToSend";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { UseSimulcastLocalEncoding, useSimulcastSend } from "../../hooks/useSimulcastSend";
import { StreamSource, TrackWithId } from "../../../types";
import clsx from "clsx";
import { useAutomaticEncodingSwitching } from "../../hooks/useAutomaticEncodingSwitching";
import { SimulcastEncodingToReceive } from "./simulcast/SimulcastEncodingToReceive";

export interface Props {
  peerId?: string;
  video: TrackWithId | null;
  flipHorizontally?: boolean;
  audio: TrackWithId | null;
  showSimulcast?: boolean;
  layers?: JSX.Element;
  className?: string;
  blockFillContent?: boolean;
  forceEncoding?: TrackEncoding;
}

// todo divide to ScreenShare and RemoteTile
const RemoteMediaPlayerTile: FC<Props> = ({
  peerId,
  video,
  audio,
  flipHorizontally,
  showSimulcast,
  layers,
  className,
  blockFillContent,
  forceEncoding,
}: Props) => {
  const { ref, setTargetEncoding, targetEncoding, smartEncoding, smartEncodingStatus, setSmartEncodingStatus } =
    useAutomaticEncodingSwitching(
      video?.encodingQuality || null,
      peerId || null,
      video?.remoteTrackId || null,
      false, // todo remove
      forceEncoding || null
    );

  const videoStream = video?.stream || null;
  const audioStream = audio?.stream || null;

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
        videoStream={videoStream}
        audioStream={audioStream}
        flipHorizontally={flipHorizontally}
        blockFillContent={blockFillContent}
      />
      {layers}
      {showSimulcast && (
        <SimulcastEncodingToReceive
          currentEncoding={video?.encodingQuality || null}
          disabled={!video?.stream}
          targetEncoding={targetEncoding || null}
          smartEncoding={smartEncoding}
          localSmartEncodingStatus={smartEncodingStatus}
          setLocalSmartEncodingStatus={setSmartEncodingStatus}
          setTargetEncoding={setTargetEncoding}
        />
      )}
    </div>
  );
};

export default RemoteMediaPlayerTile;
