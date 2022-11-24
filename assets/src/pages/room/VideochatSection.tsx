import { LocalPeer, RemotePeer } from "./hooks/usePeerState";
import MediaPlayerPeersSection, { MediaPlayerTileConfig } from "./components/StreamPlayer/MediaPlayerPeersSection";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import ScreenSharingPlayers, { VideoStreamWithMetadata } from "./components/StreamPlayer/ScreenSharingPlayers";
import React, { FC } from "react";

type Props = {
  peers: RemotePeer[];
  localPeer?: LocalPeer;
  showSimulcast?: boolean;
  showDeveloperInfo?: boolean;
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
    .map(
      ({ track, peerId, emoji, peerName }): VideoStreamWithMetadata => ({
        video: {
          stream: track.mediaStream,
          trackId: track.trackId,
          encodingQuality: track.encoding,
          metadata: track.metadata,
        },
        peerId: peerId,
        peerIcon: emoji,
        peerName: peerName,
      })
    );

  const screenSharingStreams: VideoStreamWithMetadata[] = localPeer?.tracks["screensharing"]?.stream
    ? [
        {
          video: localPeer?.tracks["screensharing"],
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

export const VideochatSection: FC<Props> = ({ peers, localPeer, showSimulcast, webrtc, showDeveloperInfo }: Props) => {
  const localUser: MediaPlayerTileConfig = {
    peerId: localPeer?.id,
    displayName: "Me",
    emoji: localPeer?.metadata?.emoji,
    video: localPeer?.tracks["camera"] ? [localPeer?.tracks["camera"]] : [],
    audio: localPeer?.tracks["audio"] ? [localPeer?.tracks["audio"]] : [],
    screenSharing: localPeer?.tracks["screensharing"] ? [localPeer?.tracks["screensharing"]] : [],
    showSimulcast: showSimulcast,
    flipHorizontally: true,
    streamSource: "local",
    playAudio: false,
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
          showDeveloperInfo={showDeveloperInfo}
          oneColumn={isScreenSharingActive}
          webrtc={webrtc}
        />
      </div>
    </div>
  );
};
