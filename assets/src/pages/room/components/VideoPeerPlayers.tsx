import React, { FC } from "react";
import VideoPlayer from "./VideoPlayer";
import { LocalPeer, Peers, Track } from "../hooks/usePeerState";

export type MediaStreamWithMetadata = {
  peerId: string;
  emoji?: string;
  displayName?: string;
  videoId?: string;
  videoStream?: MediaStream;
  audioId?: string;
  audioStream?: MediaStream;
  screenSharingStream?: MediaStream;
};

const getCameraStreams = (
  peers: Peers,
  videoStream?: MediaStream,
  audioStream?: MediaStream
): MediaStreamWithMetadata[] =>
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
    };
  });

type Props = {
  peers: Peers;
  localUser: MediaStreamWithMetadata;
};

const getStatus = (videoSteam?: MediaStream, videoTrackId?: string) => {
  // todo for now yellow status doesn't work because onTrackAdded event is ignored
  if (videoSteam === undefined && videoTrackId !== undefined) return "🟡";
  if (videoSteam === undefined && videoTrackId === undefined) return "🔴";
  if (videoSteam !== undefined && videoTrackId !== undefined) return "🟢";
  // todo something went wrong
  return "⚫️";
};

const VideoPeerPlayers: FC<Props> = ({ peers, localUser }: Props) => {
  const allCameraStreams = [localUser, ...getCameraStreams(peers)];
  console.log({ peers });
  console.log({ allCameraStreams });

  return (
    <div
      id="videos-grid"
      className="grid flex-1 grid-flow-row gap-4 justify-items-center h-full grid-cols-1 md:grid-cols-2"
    >
      {allCameraStreams.map((e, idx) => {
        const status = getStatus(e.videoStream, e.videoId);
        const currentlySharingScreen: string | undefined = e.screenSharingStream ? "🖥" : undefined;
        const audioPlayingIcon = e.audioStream ? "🔊" : "🔇";
        const emoji = e.emoji || "";

        const index = `IDX_${idx}-`
        console.log({ peerId: index, name: "peerId test" });

        return (
          <VideoPlayer
            // why this one works: key={e.peerId + e.videoId}
            // and this one does not work: key={e.peerId}
            key={index}
            peerId={e.peerId}
            videoStream={e.videoStream}
            audioStream={e.audioStream}
            metadata={{
              topLeft: currentlySharingScreen,
              topRight: emoji + " " + status,
              bottomLeft: e.displayName,
              bottomRight: audioPlayingIcon,
            }}
          />
        );
      })}
    </div>
  );
};

export default VideoPeerPlayers;
