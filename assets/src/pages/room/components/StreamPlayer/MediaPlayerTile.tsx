import React, { FC } from "react";
import MediaPlayer from "./MediaPlayer";
import { useSimulcastRemoteEncoding } from "../../hooks/useSimulcastRemoteEncoding";
import { SimulcastEncodingToSend } from "./simulcast/SimulcastEncodingToSend";
import { SimulcastRemoteLayer } from "./simulcast/SimulcastRemoteLayer";
import { MembraneWebRTC } from "@jellyfish-dev/membrane-webrtc-js";
import { UseSimulcastLocalEncoding, useSimulcastSend } from "../../hooks/useSimulcastSend";
import { StreamSource } from "../../../types";
import { TrackWithId } from "./MediaPlayerPeersSection";
import clsx from "clsx";

export interface Props {
  // peerId?: string;
  // video?: TrackWithId;
  flipHorizontally?: boolean;
  videoStream: MediaStream | null;
  audioStream: MediaStream | null;
  playAudio?: boolean;
  // showSimulcast?: boolean;
  // streamSource?: StreamSource;
  layers?: JSX.Element;
  webrtc?: MembraneWebRTC;
  className?: string;
  blockFillContent?: boolean;
  // webrtc?: MembraneWebRTC;
}

const MediaPlayerTile: FC<Props> = ({
  // peerId,
  playAudio,
  // video,
  videoStream,
  flipHorizontally,
  audioStream,
  layers,
  webrtc,
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
        // videoStream={video?.stream}
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
