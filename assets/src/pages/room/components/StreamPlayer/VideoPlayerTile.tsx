import React, { FC, useCallback } from "react";
import MediaPlayer from "./MediaPlayer";
import PeerInfoLayer from "./PeerInfoLayer";
import { useSimulcastRemoteEncoding, UseSimulcastRemoteEncodingResult } from "../../hooks/useSimulcastRemoteEncoding";
import { SimulcastEncodingToSend } from "./simulcast/SimulcastEncodingToSend";
import { SimulcastRemoteLayer } from "./simulcast/SimulcastRemoteLayer";
import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";
import { UseSimulcastLocalEncoding, useSimulcastSend } from "../../hooks/useSimulcastSend";

type LocalSimulcastConfig = {
  disableTrackEncoding?: (trackId: string, encoding: TrackEncoding) => void;
  enableTrackEncoding?: (trackId: string, encoding: TrackEncoding) => void;
};

export interface Props {
  peerId?: string;
  videoStream?: MediaStream;
  selectRemoteTrackEncoding?: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  encodingQuality?: TrackEncoding;
  videoTrackId?: string;
  flipHorizontally?: boolean;
  audioStream?: MediaStream;
  showSimulcast?: boolean;
  localSimulcastConfig?: LocalSimulcastConfig;
  enableRemoteSimulcast?: boolean;
  topLeft?: JSX.Element;
  topRight?: JSX.Element;
  bottomLeft?: JSX.Element;
  bottomRight?: JSX.Element;
}

const VideoPlayerTile: FC<Props> = ({
  peerId,
  videoStream,
  selectRemoteTrackEncoding,
  encodingQuality,
  videoTrackId,
  flipHorizontally,
  audioStream,
  showSimulcast,
  localSimulcastConfig,
  enableRemoteSimulcast,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}: Props) => {
  console.log({ videoTrackId });
  const selectRemoteEncoding = useCallback(
    (quality: TrackEncoding) => {
      console.log({ name: "selectRemoteEncoding", videoTrackId });
      if (!videoTrackId || !peerId || !selectRemoteTrackEncoding) return;
      selectRemoteTrackEncoding(peerId, videoTrackId, quality);
    },
    [videoTrackId, peerId, selectRemoteTrackEncoding]
  );

  const { desiredEncoding, setDesiredEncoding }: UseSimulcastRemoteEncodingResult = useSimulcastRemoteEncoding(
    "m",
    selectRemoteEncoding
  );

  const localEncoding: UseSimulcastLocalEncoding = useSimulcastSend(
    videoTrackId,
    localSimulcastConfig?.enableTrackEncoding,
    localSimulcastConfig?.disableTrackEncoding
  );

  return (
    <div
      data-name="video-feed"
      className="relative bg-gray-900 shadow rounded-md overflow-hidden h-full w-full aspect-video"
    >
      <MediaPlayer videoStream={videoStream} audioStream={audioStream} flipHorizontally={flipHorizontally} />
      <PeerInfoLayer topLeft={topLeft} topRight={topRight} bottomLeft={bottomLeft} bottomRight={bottomRight} />
      {showSimulcast && enableRemoteSimulcast && (
        <SimulcastRemoteLayer
          desiredEncoding={desiredEncoding}
          setDesiredEncoding={setDesiredEncoding}
          currentEncoding={encodingQuality}
          disabled={!videoStream}
        />
      )}
      {showSimulcast && localSimulcastConfig?.enableTrackEncoding && localSimulcastConfig?.disableTrackEncoding && (
        <SimulcastEncodingToSend localEncoding={localEncoding} disabled={!videoStream} />
      )}
    </div>
  );
};

export default VideoPlayerTile;
