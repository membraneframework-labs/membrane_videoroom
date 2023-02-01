import React, { FC } from "react";
import MediaPlayer from "./MediaPlayer";
import { useSimulcastRemoteEncoding } from "../../hooks/useSimulcastRemoteEncoding";
import { SimulcastEncodingToSend } from "./simulcast/SimulcastEncodingToSend";
import { SimulcastRemoteLayer } from "./simulcast/SimulcastRemoteLayer";
import { MembraneWebRTC } from "@jellyfish-dev/membrane-webrtc-js";
import { UseSimulcastLocalEncoding, useSimulcastSend } from "../../hooks/useSimulcastSend";
import { StreamSource } from "../../../types";
import { TrackWithId } from "./MediaPlayerPeersSection";

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
}: // showSimulcast,
// streamSource,
// webrtc,
Props) => {
  // const { desiredEncoding, setDesiredEncoding } = useSimulcastRemoteEncoding(
  //   "m",
  //   peerId || null,
  //   video?.remoteTrackId || null,
  //   webrtc || null
  // );

  // const localEncoding: UseSimulcastLocalEncoding = useSimulcastSend(video?.remoteTrackId || null, webrtc || null);

  return (
    <div
      data-name="video-feed"
      className="aspect-video relative h-full w-full overflow-hidden rounded-md bg-gray-900 shadow"
    >
      <MediaPlayer
        videoStream={videoStream}
        // videoStream={video?.stream}
        audioStream={audioStream}
        flipHorizontally={flipHorizontally}
        playAudio={playAudio}
      />
      {layers}
      {/*{showSimulcast && streamSource === "remote" && (*/}
      {/*  <SimulcastRemoteLayer*/}
      {/*    desiredEncoding={desiredEncoding}*/}
      {/*    setDesiredEncoding={setDesiredEncoding}*/}
      {/*    currentEncoding={video?.encodingQuality}*/}
      {/*    disabled={!video?.stream}*/}
      {/*  />*/}
      {/*)}*/}
      {/*{showSimulcast && streamSource === "local" && (*/}
      {/*  <SimulcastEncodingToSend localEncoding={localEncoding} disabled={!video?.stream} />*/}
      {/*)}*/}
    </div>
  );
};

export default MediaPlayerTile;
