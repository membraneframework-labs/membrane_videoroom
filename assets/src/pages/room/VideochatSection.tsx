import { LocalPeer, RemotePeer } from "./hooks/usePeerState";
import MediaPlayerPeersSection, { MediaPlayerTileConfig } from "./components/StreamPlayer/MediaPlayerPeersSection";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import ScreenSharingPlayers, { VideoStreamWithMetadata } from "./components/StreamPlayer/ScreenSharingPlayers";
import React, { FC } from "react";

type Props = {
  peers: RemotePeer[];
  localPeer?: LocalPeer;
  showSimulcast?: boolean;
  webrtc?: MembraneWebRTC;
};

const prepareScreenSharingStreams = (
  peers: RemotePeer[],
  localPeer?: LocalPeer
): { screenSharingStreams: VideoStreamWithMetadata[]; isScreenSharingActive: boolean } => {
  const peersScreenSharingTracks: VideoStreamWithMetadata[] = peers
    .flatMap((peer) =>
      peer.tracks.map((track) => ({
        peerId: peer.id,
        track: track,
        emoji: peer.emoji,
        peerName: peer.displayName,
      }))
    )
    .filter((element) => element.track?.metadata?.type === "screensharing")
    // todo fix now - should videoId be e.track?.trackId?
    .map(
      (element) =>
        ({
          video: {
            stream: element.track.mediaStream,
            trackId: element.track.trackId,
            encodingQuality: element.track.encoding,
          },
          peerId: element.peerId,
          peerIcon: element.emoji,
          peerName: element.peerName,
        } as VideoStreamWithMetadata)
    );

  const screenSharingStreams: VideoStreamWithMetadata[] = localPeer?.screenSharingTrackStream
    ? [
        {
          video: { stream: localPeer?.screenSharingTrackStream, trackId: localPeer?.screenSharingTrackId },
          peerId: localPeer?.id,
          peerIcon: localPeer?.metadata?.emoji,
          peerName: "Me",
        },
        ...peersScreenSharingTracks,
      ]
    : peersScreenSharingTracks;

  const isScreenSharingActive: boolean = screenSharingStreams.length > 0;
  return { screenSharingStreams, isScreenSharingActive };
};

export const VideochatSection: FC<Props> = ({ peers, localPeer, showSimulcast, webrtc }: Props) => {
  const localUser: MediaPlayerTileConfig = {
    peerId: localPeer?.id,
    displayName: "Me",
    emoji: localPeer?.metadata?.emoji,
    video: [{ stream: localPeer?.videoTrackStream, trackId: localPeer?.videoTrackId }],
    audio: [{ stream: localPeer?.audioTrackStream, trackId: localPeer?.audioTrack }],
    screenSharing: [{ stream: localPeer?.screenSharingTrackStream, trackId: localPeer?.screenSharingTrackId }],
    showSimulcast: showSimulcast,
    flipHorizontally: true,
    streamSource: "local",
  };

  const { screenSharingStreams, isScreenSharingActive } = prepareScreenSharingStreams(peers, localPeer);

  return (
    <div id="videochat" className="px-2 md:px-20 overflow-y-auto">
      <div className="flex flex-col items-center md:flex-row md:items-start justify-center h-full">
        {isScreenSharingActive && <ScreenSharingPlayers streams={screenSharingStreams || []} />}

        <MediaPlayerPeersSection
          peers={peers}
          localUser={localUser}
          showSimulcast={showSimulcast}
          oneColumn={isScreenSharingActive}
          webrtc={webrtc}
        />
      </div>
    </div>
  );
};
