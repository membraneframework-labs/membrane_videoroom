import React, { FC } from "react";
import { SimulcastPlayerConfig } from "./VideoPeerPlayersSection";
import VideoPlayerPlayer from "./VideoPlayerPlayer";
import PeerInfoLayer from "./PeerInfoLayer";
import { SimulcastQuality, useSimulcastRemoteEncoding } from "../../hooks/useSimulcastRemoteEncoding";
import { SimulcastEncodingToSend } from "./simulcast/SimulcastEncodingToSend";
import { SimulcastRemoteLayer } from "./simulcast/SimulcastRemoteLayer";
import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";

export interface Props {
  peerId: string;
  videoStream?: MediaStream;
  changeVideoEncoding: any;
  encodingQuality?: TrackEncoding;
  videoTrackId?: string;
  flipHorizontally?: boolean;
  audioStream?: MediaStream;
  simulcast?: SimulcastPlayerConfig;
  topLeft?: JSX.Element;
  topRight?: JSX.Element;
  bottomLeft?: JSX.Element;
  bottomRight?: JSX.Element;
}

const VideoPlayerTile: FC<Props> = ({
  peerId,
  videoStream,
  changeVideoEncoding,
  encodingQuality,
  videoTrackId,
  flipHorizontally,
  audioStream,
  simulcast,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}: Props) => {
  const remoteEncoding = useSimulcastRemoteEncoding();
  // useRemoteEncodingClient(webrtc, peerId, videoTrackId,remoteEncoding.quality );

  return (
    <div
      data-name="video-feed"
      className="relative bg-gray-900 shadow rounded-md overflow-hidden h-full w-full aspect-video"
    >
      <VideoPlayerPlayer videoStream={videoStream} audioStream={audioStream} flipHorizontally={flipHorizontally} />
      <PeerInfoLayer topLeft={topLeft} topRight={topRight} bottomLeft={bottomLeft} bottomRight={bottomRight} />
      {simulcast?.show && !simulcast?.localEncoding && (
        <SimulcastRemoteLayer
          quality={encodingQuality}
          remoteEncoding={remoteEncoding}
          changeRemoteEncoding={(quality: SimulcastQuality) => {
            changeVideoEncoding(peerId, videoTrackId, quality);
          }}
        />
      )}
      {simulcast &&
        simulcast.show &&
        simulcast.localEncoding &&
        simulcast.disableTrackEncoding &&
        simulcast.enableTrackEncoding && (
          <SimulcastEncodingToSend
            localEncoding={simulcast.localEncoding}
            disableTrackEncoding={simulcast.disableTrackEncoding}
            enableTrackEncoding={simulcast.enableTrackEncoding}
          />
        )}
    </div>
  );
};

export default VideoPlayerTile;
