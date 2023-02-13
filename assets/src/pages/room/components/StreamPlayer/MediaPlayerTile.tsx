import React, { FC } from "react";
import MediaPlayer from "./MediaPlayer";
import { SimulcastEncodingToSend } from "./simulcast/SimulcastEncodingToSend";
import { SimulcastRemoteLayer } from "./simulcast/SimulcastRemoteLayer";
import { MembraneWebRTC } from "@jellyfish-dev/membrane-webrtc-js";
import { UseSimulcastLocalEncoding, useSimulcastSend } from "../../hooks/useSimulcastSend";
import { StreamSource } from "../../../types";
import { TrackWithId } from "./MediaPlayerPeersSection";
import clsx from "clsx";
import { useAutomaticEncodingSwitching } from "../../hooks/useAutomaticEncodingSwitching";

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
  className?: string;
  blockFillContent?: boolean;
  disableQualityReduction?: boolean;
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
  disableQualityReduction,
}: Props) => {
  const isRemote = streamSource === "remote";
  const isLocal = streamSource === "local";

  const { ref, targetEncoding, setTargetEncoding, userSelectedEncoding } = useAutomaticEncodingSwitching(
    video?.encodingQuality || null,
    peerId || null,
    video?.remoteTrackId || null,
    isLocal,
    disableQualityReduction || false,
    webrtc || null
  );

  const localEncoding: UseSimulcastLocalEncoding = useSimulcastSend(video?.remoteTrackId || null, webrtc || null);

  return (
    <div
      ref={ref}
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
      {showSimulcast && isRemote && (
        <SimulcastRemoteLayer
          userSelectedEncoding={userSelectedEncoding}
          targetEncoding={targetEncoding || null}
          setTargetEncoding={setTargetEncoding}
          currentEncoding={video?.encodingQuality}
          disabled={!video?.stream}
        />
      )}
      {showSimulcast && isLocal && <SimulcastEncodingToSend localEncoding={localEncoding} disabled={!video?.stream} />}
    </div>
  );
};

export default MediaPlayerTile;
