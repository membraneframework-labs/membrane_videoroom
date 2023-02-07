import React, { FC } from "react";
import MediaPlayer from "./MediaPlayer";
import { useSimulcastRemoteEncoding } from "../../hooks/useSimulcastRemoteEncoding";
import { SimulcastEncodingToSend } from "./simulcast/SimulcastEncodingToSend";
import { SimulcastRemoteLayer } from "./simulcast/SimulcastRemoteLayer";
import { MembraneWebRTC } from "@jellyfish-dev/membrane-webrtc-js";
import { UseSimulcastLocalEncoding, useSimulcastSend } from "../../hooks/useSimulcastSend";
import { StreamSource, TrackWithId } from "../../../types";
import clsx from "clsx";

export interface Props {
  peerId?: string;
  video: TrackWithId | null;
  flipHorizontally?: boolean;
  audioStream?: MediaStream;
  playAudio?: boolean;
  showSimulcast?: boolean;
  streamSource?: StreamSource;
  layers?: JSX.Element;
  webrtc?: MembraneWebRTC;
  className?: string;
  blockFillContent?: boolean;
}

const MediaPlayerTile: FC<Props> = ({
  peerId,
  playAudio,
  video,
  flipHorizontally,
  audioStream,
  showSimulcast,
  streamSource,
  layers,
  webrtc,
  className,
  blockFillContent,
}: Props) => {
  const { desiredEncoding, setDesiredEncoding } = useSimulcastRemoteEncoding(
    "m",
    peerId || null,
    video?.remoteTrackId || null,
    webrtc || null
  );

  const localEncoding: UseSimulcastLocalEncoding = useSimulcastSend(video?.remoteTrackId || null, webrtc || null);

  return (
    <div
      data-name="video-feed"
      className={clsx(
        className,
        "relative flex h-full w-full justify-center overflow-hidden",
        "rounded-xl border border-brand-dark-blue-300 bg-gray-900",
        "group"
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
          currentEncoding={video?.encodingQuality}
          disabled={!video?.stream}
        />
      )}
      {showSimulcast && streamSource === "local" && (
        <SimulcastEncodingToSend localEncoding={localEncoding} disabled={!video?.stream} />
      )}
    </div>
  );
};

export default MediaPlayerTile;
