import React, { FC } from "react";
import { Peers, Track } from "../../hooks/usePeerState";
import VideoPlayerTile from "./VideoPlayerTile";
import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";
import clsx from "clsx";

export type SimulcastPlayerConfig = {
  show: boolean;
  enableTrackEncoding?: (trackId: string, encoding: TrackEncoding) => void;
  disableTrackEncoding?: (trackId: string, encoding: TrackEncoding) => void;
};

export type MediaPlayerConfig = {
  peerId?: string;
  emoji?: string;
  flipHorizontally: boolean;
  displayName?: string;
  videoId?: string;
  videoStream?: MediaStream;
  audioId?: string;
  audioStream?: MediaStream;
  autoplayAudio: boolean;
  screenSharingStream?: MediaStream;
  simulcast?: SimulcastPlayerConfig;
  encodingQuality?: TrackEncoding;
  remoteSimulcast?: boolean;
};

const getCameraStreams = (peers: Peers, showSimulcast: boolean): MediaPlayerConfig[] =>
  Object.values(peers).map((peer) => {
    const video: Track | undefined = peer.tracks.find((track) => track?.metadata?.type === "camera");
    const screenSharingStream: MediaStream | undefined = peer.tracks.find(
      (track) => track?.metadata?.type === "screensharing"
    )?.mediaStream;
    const audio: Track | undefined = peer.tracks.find((track) => track?.metadata?.type === "audio");

    return {
      peerId: peer.id,
      emoji: peer.emoji,
      displayName: peer.displayName,
      videoStream: video?.mediaStream,
      videoId: video?.trackId,
      audioStream: audio?.mediaStream,
      audioId: audio?.trackId,
      screenSharingStream: screenSharingStream,
      autoplayAudio: true,
      simulcast: {
        show: showSimulcast,
      },
      flipHorizontally: false,
      encodingQuality: video?.encoding,
      remoteSimulcast: true,
    };
  });

type Props = {
  peers: Peers;
  localUser: MediaPlayerConfig;
  showSimulcast: boolean;
  selectRemoteTrackEncoding: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  oneColumn?: boolean;
};

const getStatus = (videoSteam?: MediaStream, videoTrackId?: string) => {
  // todo for now yellow status doesn't work because onTrackAdded event is ignored
  if (videoSteam === undefined && videoTrackId !== undefined) return "🟡";
  if (videoSteam === undefined && videoTrackId === undefined) return "🔴";
  if (videoSteam !== undefined && videoTrackId !== undefined) return "🟢";
  // todo something went wrong
  return "⚫️";
};

const VideoPeerPlayersSection: FC<Props> = ({
  peers,
  localUser,
  showSimulcast,
  selectRemoteTrackEncoding,
  oneColumn,
}: Props) => {
  const allCameraStreams = [localUser, ...getCameraStreams(peers, showSimulcast)];
  console.log({ peers });
  console.log({ allCameraStreams });

  return (
    <div
      id="videos-grid"
      className={clsx({
        "grid flex-1 grid-flow-row gap-4 justify-items-center h-full grid-cols-1": true,
        "md:grid-cols-2": !oneColumn,
      })}
    >
      {allCameraStreams.map((e) => {
        const videoStatus = "📹" + getStatus(e.videoStream, e.videoId);
        const currentlySharingScreen: string = e.screenSharingStream ? "🖥🟢" : "🖥🔴";
        const audioIcon = e.audioStream ? "🔊🟢" : "🔊🔴";
        const emoji = e.emoji || "";
        console.log({ currEncoding: e.encodingQuality });

        // TODO inline VidePeerPlayerTile
        return (
          <VideoPlayerTile
            key={e.peerId}
            peerId={e.peerId}
            videoStream={e.videoStream}
            videoTrackId={e.videoId}
            audioStream={e.autoplayAudio ? e.audioStream : undefined}
            selectRemoteTrackEncoding={selectRemoteTrackEncoding}
            encodingQuality={e.encodingQuality}
            topLeft={<div>{emoji}</div>}
            topRight={
              <div className="text-right">
                <span className="ml-2">{currentlySharingScreen}</span>
                <span className="ml-2">{videoStatus}</span>
                <span className="ml-2">{audioIcon}</span>
              </div>
            }
            bottomLeft={<div>{e.displayName}</div>}
            showSimulcast={showSimulcast}
            localSimulcastConfig={{
              disableTrackEncoding: e.simulcast?.disableTrackEncoding,
              enableTrackEncoding: e.simulcast?.enableTrackEncoding,
            }}
            enableRemoteSimulcast={e.remoteSimulcast}
            flipHorizontally={e.flipHorizontally}
          />
        );
      })}
    </div>
  );
};

export default VideoPeerPlayersSection;
