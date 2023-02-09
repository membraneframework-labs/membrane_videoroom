import type { FC } from "react";
import React from "react";
import MediaPlayer from "./MediaPlayer";
import { useSimulcastRemoteEncoding } from "../../hooks/useSimulcastRemoteEncoding";
import { SimulcastEncodingToSend } from "./simulcast/SimulcastEncodingToSend";
import { SimulcastRemoteLayer } from "./simulcast/SimulcastRemoteLayer";
import type { UseSimulcastLocalEncoding} from "../../hooks/useSimulcastSend";
import { useSimulcastSend } from "../../hooks/useSimulcastSend";
import type { StreamSource } from "../../../types";
import type { TrackWithId } from "./MediaPlayerPeersSection";
import clsx from "clsx";

export interface Props {
  peerId?: string;
  video?: TrackWithId;
  flipHorizontally?: boolean;
  audioStream?: MediaStream;
  playAudio?: boolean;
  showSimulcast?: boolean;
  streamSource?: StreamSource;
  layers?: JSX.Element;
  className?: string;
  blockFillContent?: boolean;
}

const MediaPlayerTileLocal: FC<Props> = ({
  peerId,
  playAudio,
  video,
  flipHorizontally,
  audioStream,
  showSimulcast,
  streamSource,
  layers,
  className,
  blockFillContent,
}: Props) => {
  const { desiredEncoding, setDesiredEncoding } = useSimulcastRemoteEncoding(
    "m",
    peerId || null,
    video?.remoteTrackId || null
  );

  const localEncoding: UseSimulcastLocalEncoding = useSimulcastSend(video?.remoteTrackId || null);

  return (
    <div
      data-name="video-feed"
      className={clsx(
        className,
        "relative flex h-full w-full justify-center overflow-hidden rounded-xl border border-brand-dark-blue-300 bg-gray-900"
      )}
    >
      <MediaPlayer
        videoStream={video?.stream}
        audioStream={audioStream}
        flipHorizontally={flipHorizontally}
        playAudio={playAudio}
        blockFillContent={blockFillContent}
      />
      {layers}
      {showSimulcast && streamSource === "remote" && (
        <SimulcastRemoteLayer
          desiredEncoding={desiredEncoding}
          setDesiredEncoding={setDesiredEncoding}
          currentEncoding={video?.encodingQuality || null}
          disabled={!video?.stream}
        />
      )}
      {showSimulcast && streamSource === "local" && (
        <SimulcastEncodingToSend localEncoding={localEncoding} disabled={!video?.stream} />
      )}
    </div>
  );
};

export default MediaPlayerTileLocal;
