import React, { FC } from "react";
import MediaPlayer from "./MediaPlayer";
import { SimulcastEncodingToSend } from "./simulcast/SimulcastEncodingToSend";
import { SimulcastRemoteLayer } from "./simulcast/SimulcastRemoteLayer";
import { MembraneWebRTC, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { UseSimulcastLocalEncoding, useSimulcastSend } from "../../hooks/useSimulcastSend";
import { StreamSource, TrackWithId } from "../../../types";
import clsx from "clsx";
import { useAutomaticEncodingSwitching } from "../../hooks/useAutomaticEncodingSwitching";
import { useDeveloperInfo } from "../../../../contexts/DeveloperInfoContext";

export interface Props {
  peerId?: string;
  video: TrackWithId | null;
  flipHorizontally?: boolean;
  audio: TrackWithId | null;
  showSimulcast?: boolean;
  streamSource?: StreamSource;
  layers?: JSX.Element;
  webrtc?: MembraneWebRTC;
  className?: string;
  blockFillContent?: boolean;
  forceEncoding?: TrackEncoding | null;
}

const MediaPlayerTile: FC<Props> = ({
  peerId,
  video,
  audio,
  flipHorizontally,
  showSimulcast,
  streamSource,
  layers,
  webrtc,
  className,
  blockFillContent,
  forceEncoding,
}: Props) => {
  const { smartLayerSwitching } = useDeveloperInfo();

  const isRemote = streamSource === "remote";
  const isLocal = streamSource === "local";

  const {
    ref,
    tileSizeEncoding,
    setTargetEncoding,
    targetEncoding,
    smartEncoding,
    smartEncodingStatus,
    setSmartEncodingStatus,
  } = useAutomaticEncodingSwitching(
    video?.encodingQuality || null,
    peerId || null,
    video?.remoteTrackId || null,
    !smartLayerSwitching.status || isLocal,
    forceEncoding || null,
    webrtc || null
  );

  const localEncoding: UseSimulcastLocalEncoding = useSimulcastSend(video?.remoteTrackId || null, webrtc || null);
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
      {showSimulcast && isRemote && (
        <SimulcastRemoteLayer
          targetEncoding={targetEncoding || null}
          setTargetEncoding={setTargetEncoding}
          tileSizeEncoding={tileSizeEncoding}
          smartEncoding={smartEncoding}
          smartEncodingStatus={smartEncodingStatus}
          setSmartEncodingStatus={setSmartEncodingStatus}
          currentEncoding={video?.encodingQuality}
          disabled={!video?.stream}
        />
      )}
      {showSimulcast && isLocal && <SimulcastEncodingToSend localEncoding={localEncoding} disabled={!video?.stream} />}
    </div>
  );
};

export default MediaPlayerTile;
