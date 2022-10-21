import React, { FC } from "react";
import { SimulcastPlayerConfig } from "./VideoPeerPlayersSection";
import VideoPlayerPlayer from "./VideoPlayerPlayer";
import PeerInfoLayer from "./PeerInfoLayer";
import { useSimulcastRemoteEncoding, UseSimulcastRemoteEncodingResult } from "../../hooks/useSimulcastRemoteEncoding";
import { SimulcastEncodingToSend } from "./simulcast/SimulcastEncodingToSend";
import { SimulcastRemoteLayer } from "./simulcast/SimulcastRemoteLayer";

export interface Props {
  videoStream?: MediaStream;
  flipHorizontally?: boolean;
  audioStream?: MediaStream;
  simulcast?: SimulcastPlayerConfig;
  topLeft?: JSX.Element;
  topRight?: JSX.Element;
  bottomLeft?: JSX.Element;
  bottomRight?: JSX.Element;
}

const VideoPlayerTile: FC<Props> = ({
  videoStream,
  flipHorizontally,
  audioStream,
  simulcast,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}: Props) => {
  const remoteEncoding = useSimulcastRemoteEncoding();

  return (
    <div
      data-name="video-feed"
      className="relative bg-gray-900 shadow rounded-md overflow-hidden h-full w-full aspect-video"
    >
      <VideoPlayerPlayer videoStream={videoStream} audioStream={audioStream} flipHorizontally={flipHorizontally} />
      <PeerInfoLayer topLeft={topLeft} topRight={topRight} bottomLeft={bottomLeft} bottomRight={bottomRight} />
      {simulcast?.show && !simulcast?.localEncoding && <SimulcastRemoteLayer remoteEncoding={remoteEncoding} />}
      {simulcast?.show && simulcast?.localEncoding && (
        <SimulcastEncodingToSend localEncoding={simulcast?.localEncoding} />
      )}
    </div>
  );
};

export default VideoPlayerTile;
