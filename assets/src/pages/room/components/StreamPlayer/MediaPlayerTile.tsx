import React, { FC } from "react";
import MediaPlayer from "./MediaPlayer";
import { useSimulcastRemoteEncoding } from "../../hooks/useSimulcastRemoteEncoding";
import { SimulcastEncodingToSend } from "./simulcast/SimulcastEncodingToSend";
import { SimulcastRemoteLayer } from "./simulcast/SimulcastRemoteLayer";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import { UseSimulcastLocalEncoding, useSimulcastSend } from "../../hooks/useSimulcastSend";
import { StreamSource } from "../../../types";
import { TrackWithId } from "./MediaPlayerPeersSection";

export interface Props {
  peerId?: string;
  video?: TrackWithId;
  flipHorizontally?: boolean;
  audioStream?: MediaStream;
  playAudio?: boolean;
  showSimulcast?: boolean;
  streamSource?: StreamSource;
  layers?: JSX.Element;
  webrtc?: MembraneWebRTC;
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
}: Props) => {
  const { desiredEncoding, setDesiredEncoding } = useSimulcastRemoteEncoding("m", peerId, video?.remoteTrackId, webrtc);

  const localEncoding: UseSimulcastLocalEncoding = useSimulcastSend(video?.remoteTrackId, webrtc);

  return (
    <div
      data-name="video-feed"
      className="relative bg-gray-900 shadow rounded-md overflow-hidden h-full w-full aspect-video"
    >
      <MediaPlayer
        videoStream={video?.stream}
        audioStream={audioStream}
        flipHorizontally={flipHorizontally}
        playAudio={playAudio}
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
