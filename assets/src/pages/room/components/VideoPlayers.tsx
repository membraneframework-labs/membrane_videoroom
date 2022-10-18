import React, { FC } from "react";
import VideoPlayer from "./VideoPlayer";
import { LocalPeer, Peers, Track } from "../hooks/usePeerState";
import { MediaStreamWithMetadata } from "../RoomPage";

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

    return {
      peerId: peer.id,
      videoStream: video?.mediaStream,
      videoId: video?.trackId,
      screenSharingStream: screenSharingStream,
    };
  });

type Props = {
  peers: Peers;
  localStreams: MediaStreamWithMetadata;
};

const getStatus = (videoSteam?: MediaStream, videoTrackId?: string) => {
  // todo for now yellow status doesn't work because onTrackAdded event is ignored
  if (videoSteam === undefined && videoTrackId !== undefined) return "🟡";
  if (videoSteam === undefined && videoTrackId === undefined) return "🔴";
  if (videoSteam !== undefined && videoTrackId !== undefined) return "🟢";
  // todo something went wrong
  return "⚫️";
};

const VideoPlayers: FC<Props> = ({ peers, localStreams }: Props) => {
  const allCameraStreams = [localStreams, ...getCameraStreams(peers)];
  console.log({ peers });
  console.log({ allCameraStreams });

  return (
    <>
      {allCameraStreams.map((e) => {
        const status = getStatus(e.videoStream, e.videoId);
        const currentlySharingScreen: string | undefined = e.screenSharingStream ? "🖥" : undefined;

        return (
          <VideoPlayer
            key={e.peerId + ":" + e.videoId}
            peerId={e.peerId}
            videoStream={e.videoStream}
            metadata={{ topLeft: currentlySharingScreen, topRight: status, bottomLeft: e.peerId }}
          />
        );
      })}
    </>
  );
};

export default VideoPlayers;
