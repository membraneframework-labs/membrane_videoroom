import React, { FC, useEffect } from "react";
import { RemotePeer, Track } from "../../hooks/usePeerState";
import MediaPlayerTile from "./MediaPlayerTile";
import { MembraneWebRTC, TrackEncoding } from "@membraneframework/membrane-webrtc-js";
import clsx from "clsx";
import { StreamSource } from "../../../types";

export type TrackXXX = {
  stream?: MediaStream;
  trackId?: string;
  encodingQuality?: TrackEncoding;
};

export type MediaPlayerConfig = {
  peerId?: string;
  emoji?: string;
  flipHorizontally?: boolean;
  displayName?: string;
  video: TrackXXX[];
  audio: TrackXXX[];
  screenSharing: TrackXXX[];
  showSimulcast?: boolean;
  remoteSimulcast?: boolean;
  streamSource: StreamSource;
};

const getCameraStreams = (peers: RemotePeer[], showSimulcast?: boolean): MediaPlayerConfig[] =>
  peers.map((peer) => {
    const videoTracks: Track[] = peer.tracks
      .filter((track) => track?.metadata?.type === "camera")
      .map((track) => ({ stream: track.mediaStream, trackId: track.trackId, encoding: track.encoding }));
    const audioTracks: Track[] = peer.tracks
      .filter((track) => track?.metadata?.type === "audio")
      .map((track) => ({ stream: track.mediaStream, trackId: track.trackId, encoding: track.encoding }));
    const screenSharingTracks: Track[] = peer.tracks
      .filter((track) => track?.metadata?.type === "screensharing")
      .map((track) => ({ stream: track.mediaStream, trackId: track.trackId, encoding: track.encoding }));

    return {
      peerId: peer.id,
      emoji: peer.emoji,
      displayName: peer.displayName,
      video: videoTracks,
      audio: audioTracks,
      screenSharing: screenSharingTracks,
      autoplayAudio: true,
      showSimulcast: showSimulcast,
      flipHorizontally: false,
      remoteSimulcast: true,
      streamSource: "remote",
    } as MediaPlayerConfig;
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
  const allPeersConfig = [localUser, ...getCameraStreams(peers, showSimulcast)];

  return (
    <div
      id="videos-grid"
      className={clsx({
        "grid flex-1 grid-flow-row gap-4 justify-items-center h-full grid-cols-1": true,
        "md:grid-cols-2": !oneColumn,
      })}
    >
      {allPeersConfig.map((config, idx) => {
        // todo for now only first audio, video and screen sharing stream are handled
        const video: TrackXXX | undefined = config.video[0];
        const screenSharing: TrackXXX | undefined = config.screenSharing[0];
        const audio: TrackXXX | undefined = config.audio[0];

        const videoStatus = "📹" + getStatus(video?.stream, video?.trackId);
        const currentlySharingScreen: string = screenSharing?.stream ? "🖥🟢" : "🖥🔴";
        const audioIcon = audio?.stream ? "🔊🟢" : "🔊🔴";
        const emoji = config.emoji || "";

        // TODO inline VidePeerPlayerTile
        return (
          <MediaPlayerTile
            key={idx}
            peerId={config.peerId}
            video={video}
            audioStream={audio?.stream}
            topLeft={<div>{emoji}</div>}
            topRight={
              <div className="text-right">
                <span className="ml-2">{currentlySharingScreen}</span>
                <span className="ml-2">{videoStatus}</span>
                <span className="ml-2">{audioIcon}</span>
              </div>
            }
            bottomLeft={<div>{config.displayName}</div>}
            showSimulcast={showSimulcast}
            streamSource={config.streamSource}
            flipHorizontally={config.flipHorizontally}
            webrtc={webrtc}
          />
        );
      })}
    </div>
  );
};

export default MediaPlayerPeersSection;
