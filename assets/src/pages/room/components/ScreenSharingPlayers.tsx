import React, { FC } from "react";
import { Peers } from "../hooks/usePeerState";
import VideoPlayer from "./VideoPlayer";

export type VideoStreamWithMetadata = {
  peerId: string;
  videoId?: string;
  videoStream?: MediaStream;
};

const prepareScreenSharingStreams = (
  peers: Peers,
  localStream?: MediaStream
): { screenSharingStreams: VideoStreamWithMetadata[]; isScreenSharingActive: boolean } => {
  const peersScreenSharingTracks: VideoStreamWithMetadata[] = Object.values(peers)
    .flatMap((peer) => peer.tracks.map((track) => ({ peerId: peer.id, track: track })))
    .filter((e) => e.track?.metadata?.type === "screensharing")
    // todo fix now - should videoId be e.track?.trackId?
    .map((e) => ({ videoStream: e.track.mediaStream, peerId: e.peerId, videoId: e.track?.mediaStreamTrack?.id }));

  const screenSharingStreams: VideoStreamWithMetadata[] = localStream
    ? [{ videoStream: localStream, peerId: "(Me) screen", videoId: "(Me) screen" }, ...peersScreenSharingTracks]
    : peersScreenSharingTracks;

  const isScreenSharingActive: boolean = screenSharingStreams.length > 0;
  return { screenSharingStreams, isScreenSharingActive };
};

type Props = {
  peers: Peers;
  videoStream?: MediaStream;
};

const ScreenSharingPlayers: FC<Props> = ({ peers, videoStream }: Props) => {
  const { screenSharingStreams, isScreenSharingActive } = prepareScreenSharingStreams(peers, videoStream);

  return (
    <>
      {isScreenSharingActive && (
        <div
          id="screensharings-grid"
          className="h-full mb-3 md:mr-3 md:mb-none active-screensharing-grid grid-cols-1 md:grid-cols-1"
        >
          {screenSharingStreams.map((e) => (
            <VideoPlayer
              key={e.peerId + ":" + e.videoId}
              peerId={e.peerId}
              videoStream={e.videoStream}
              metadata={{ bottomLeft: e.peerId }}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ScreenSharingPlayers;