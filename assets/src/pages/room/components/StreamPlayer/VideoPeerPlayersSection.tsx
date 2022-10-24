import React, { FC } from "react";
import { Peers, Track } from "../../hooks/usePeerState";
import VideoPlayerTile from "./VideoPlayerTile";
import { UseSimulcastLocalEncoding } from "../../hooks/useSimulcastSend";
import { SimulcastQuality } from "../../hooks/useSimulcastRemoteEncoding";
import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";

export type SimulcastPlayerConfig = {
  show: boolean;
  localEncoding?: UseSimulcastLocalEncoding;
  enableTrackEncoding?: (encoding: SimulcastQuality) => void;
  disableTrackEncoding?: (encoding: SimulcastQuality) => void;
};

export type PlayerConfig = {
  peerId: string;
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
};

const getCameraStreams = (peers: Peers, showSimulcast: boolean): PlayerConfig[] =>
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
    };
  });

type Props = {
  peers: Peers;
  localUser: PlayerConfig;
  showSimulcast: boolean;
  changeVideoEncoding: any;
};

const getStatus = (videoSteam?: MediaStream, videoTrackId?: string) => {
  // todo for now yellow status doesn't work because onTrackAdded event is ignored
  if (videoSteam === undefined && videoTrackId !== undefined) return "🟡";
  if (videoSteam === undefined && videoTrackId === undefined) return "🔴";
  if (videoSteam !== undefined && videoTrackId !== undefined) return "🟢";
  // todo something went wrong
  return "⚫️";
};

const VideoPeerPlayersSection: FC<Props> = ({ peers, localUser, showSimulcast, changeVideoEncoding }: Props) => {
  const allCameraStreams = [localUser, ...getCameraStreams(peers, showSimulcast)];
  console.log({ peers });
  console.log({ allCameraStreams });

  return (
    <div
      id="videos-grid"
      className="grid flex-1 grid-flow-row gap-4 justify-items-center h-full grid-cols-1 md:grid-cols-2"
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
            changeVideoEncoding={changeVideoEncoding}
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
            simulcast={e.simulcast}
            flipHorizontally={e.flipHorizontally}
          />
        );
      })}
    </div>
  );
};

export default VideoPeerPlayersSection;
