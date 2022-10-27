import React, { FC, useCallback } from "react";
import MediaPlayer from "./MediaPlayer";
import PeerInfoLayer from "./PeerInfoLayer";
import { useSimulcastRemoteEncoding, UseSimulcastRemoteEncodingResult } from "../../hooks/useSimulcastRemoteEncoding";
import { SimulcastEncodingToSend } from "./simulcast/SimulcastEncodingToSend";
import { SimulcastRemoteLayer } from "./simulcast/SimulcastRemoteLayer";
import { MembraneWebRTC, TrackEncoding } from "@membraneframework/membrane-webrtc-js";
import { UseSimulcastLocalEncoding, useSimulcastSend } from "../../hooks/useSimulcastSend";
import { StreamSource } from "../../../types";

export interface Props {
  peerId?: string;
  videoStream?: MediaStream;
  encodingQuality?: TrackEncoding;
  videoTrackId?: string;
  flipHorizontally?: boolean;
  audioStream?: MediaStream;
  showSimulcast?: boolean;
  streamSource: StreamSource;
  topLeft?: JSX.Element;
  topRight?: JSX.Element;
  bottomLeft?: JSX.Element;
  bottomRight?: JSX.Element;
  webrtc?: MembraneWebRTC;
}

const VideoPlayerTile: FC<Props> = ({
  peerId,
  videoStream,
  encodingQuality,
  videoTrackId,
  flipHorizontally,
  audioStream,
  showSimulcast,
  streamSource,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  webrtc,
}: Props) => {
  const { desiredEncoding, setDesiredEncoding } = useSimulcastRemoteEncoding("m", peerId, videoTrackId, webrtc);

  const localEncoding: UseSimulcastLocalEncoding = useSimulcastSend(videoTrackId, webrtc);

  return (
    <div
      data-name="video-feed"
      className="relative bg-gray-900 shadow rounded-md overflow-hidden h-full w-full aspect-video"
    >
      <MediaPlayer videoStream={videoStream} audioStream={audioStream} flipHorizontally={flipHorizontally} />
      <PeerInfoLayer topLeft={topLeft} topRight={topRight} bottomLeft={bottomLeft} bottomRight={bottomRight} />
      {showSimulcast && streamSource === "remote" && (
        <SimulcastRemoteLayer
          desiredEncoding={desiredEncoding}
          setDesiredEncoding={setDesiredEncoding}
          currentEncoding={encodingQuality}
          disabled={!videoStream}
        />
      )}
      {showSimulcast && streamSource === "local" && (
        <SimulcastEncodingToSend localEncoding={localEncoding} disabled={!videoStream} />
      )}
    </div>
  );
};

export default VideoPlayerTile;
