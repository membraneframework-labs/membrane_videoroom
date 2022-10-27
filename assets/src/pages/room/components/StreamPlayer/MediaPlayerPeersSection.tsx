import React, { FC } from "react";
import { RemotePeer, Track } from "../../hooks/usePeerState";
import VideoPlayerTile from "./VideoPlayerTile";
import { MembraneWebRTC, TrackEncoding } from "@membraneframework/membrane-webrtc-js";
import clsx from "clsx";
import { StreamSource } from "../../../types";

export type MediaPlayerConfig = {
  peerId?: string;
  emoji?: string;
  flipHorizontally?: boolean;
  displayName?: string;
  videoId?: string;
  videoStream?: MediaStream;
  audioId?: string;
  audioStream?: MediaStream;
  autoplayAudio?: boolean;
  screenSharingStream?: MediaStream;
  showSimulcast?: boolean;
  encodingQuality?: TrackEncoding;
  remoteSimulcast?: boolean;
  streamSource: StreamSource;
};

const getCameraStreams = (peers: RemotePeer[], showSimulcast?: boolean): MediaPlayerConfig[] =>
  peers.map((peer) => {
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
      showSimulcast: showSimulcast,
      flipHorizontally: false,
      encodingQuality: video?.encoding,
      remoteSimulcast: true,
      streamSource: "remote",
    };
  });

type Props = {
  peers: RemotePeer[];
  localUser: MediaPlayerConfig;
  showSimulcast?: boolean;
  selectRemoteTrackEncoding?: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  oneColumn?: boolean;
  webrtc?: MembraneWebRTC;
};

const getStatus = (videoSteam?: MediaStream, videoTrackId?: string) => {
  // todo for now yellow status doesn't work because onTrackAdded event is ignored
  if (videoSteam === undefined && videoTrackId !== undefined) return "🟡";
  if (videoSteam === undefined && videoTrackId === undefined) return "🔴";
  if (videoSteam !== undefined && videoTrackId !== undefined) return "🟢";
  // todo something went wrong
  return "⚫️";
};

const MediaPlayerPeersSection: FC<Props> = ({ peers, localUser, showSimulcast, oneColumn, webrtc }: Props) => {
  const allCameraStreams = [localUser, ...getCameraStreams(peers, showSimulcast)];

  return (
    <div
      id="videos-grid"
      className={clsx({
        "grid flex-1 grid-flow-row gap-4 justify-items-center h-full grid-cols-1": true,
        "md:grid-cols-2": !oneColumn,
      })}
    >
      {allCameraStreams.map((e, idx) => {
        const videoStatus = "📹" + getStatus(e.videoStream, e.videoId);
        const currentlySharingScreen: string = e.screenSharingStream ? "🖥🟢" : "🖥🔴";
        const audioIcon = e.audioStream ? "🔊🟢" : "🔊🔴";
        const emoji = e.emoji || "";
        // console.log({ currEncoding: e.encodingQuality });

        // TODO inline VidePeerPlayerTile
        return (
          <VideoPlayerTile
            key={idx}
            peerId={e.peerId}
            videoStream={e.videoStream}
            videoTrackId={e.videoId}
            audioStream={e.autoplayAudio ? e.audioStream : undefined}
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
            streamSource={e.streamSource}
            flipHorizontally={e.flipHorizontally}
            webrtc={webrtc}
          />
        );
      })}
    </div>
  );
};

export default MediaPlayerPeersSection;
