import React, { FC } from "react";
import { RemotePeer, Track } from "../../hooks/usePeerState";
import MediaPlayerTile from "./MediaPlayerTile";
import { MembraneWebRTC, TrackEncoding } from "@membraneframework/membrane-webrtc-js";
import clsx from "clsx";
import { StreamSource, TrackType } from "../../../types";

export type TrackWithId = {
  stream?: MediaStream;
  trackId?: string;
  encodingQuality?: TrackEncoding;
};

export type MediaPlayerTileConfig = {
  peerId?: string;
  emoji?: string;
  flipHorizontally?: boolean;
  displayName?: string;
  video: TrackWithId[];
  audio: TrackWithId[];
  screenSharing: TrackWithId[];
  showSimulcast?: boolean;
  remoteSimulcast?: boolean;
  streamSource: StreamSource;
};

const getTracks = (tracks: Track[], type: TrackType): TrackWithId[] =>
  tracks
    .filter((track) => track?.metadata?.type === type)
    .map(
      (track): TrackWithId => ({
        stream: track.mediaStream,
        trackId: track.trackId,
        encodingQuality: track.encoding,
      })
    );

const getCameraStreams = (peers: RemotePeer[], showSimulcast?: boolean): MediaPlayerTileConfig[] => {
  return peers.map((peer) => {
    const videoTracks: TrackWithId[] = getTracks(peer.tracks, "camera");
    const audioTracks: TrackWithId[] = getTracks(peer.tracks, "audio");
    const screenSharingTracks: TrackWithId[] = getTracks(peer.tracks, "screensharing");

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
    } as MediaPlayerTileConfig;
  });
};

type Props = {
  peers: RemotePeer[];
  localUser: MediaPlayerTileConfig;
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
  const allPeersConfig: MediaPlayerTileConfig[] = [localUser, ...getCameraStreams(peers, showSimulcast)];

  console.log({ name: "allPeersConfig", allPeersConfig });

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
        const video: TrackWithId | undefined = config.video[0];
        const screenSharing: TrackWithId | undefined = config.screenSharing[0];
        const audio: TrackWithId | undefined = config.audio[0];

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
