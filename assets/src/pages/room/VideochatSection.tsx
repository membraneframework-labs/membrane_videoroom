import { LocalPeer, RemotePeer } from "./hooks/usePeerState";
import MediaPlayerPeersSection, { MediaPlayerTileConfig } from "./components/StreamPlayer/MediaPlayerPeersSection";
import { MembraneWebRTC } from "@jellyfish-dev/membrane-webrtc-js";
import ScreenSharingPlayers, { VideoStreamWithMetadata } from "./components/StreamPlayer/ScreenSharingPlayers";
import React, { FC } from "react";
import { LOCAL_PEER_NAME, LOCAL_SCREEN_SHARING_ID, LOCAL_VIDEO_ID } from "./consts";
import clsx from "clsx";

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
          remoteTrackId: track.trackId,
          encodingQuality: track.encoding,
          metadata: track.metadata,
        },
        mediaPlayerId: track.trackId,
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
          peerName: LOCAL_PEER_NAME,
          mediaPlayerId: LOCAL_SCREEN_SHARING_ID,
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
    displayName: LOCAL_PEER_NAME,
    emoji: localPeer?.metadata?.emoji,
    video: localPeer?.tracks["camera"] ? [localPeer?.tracks["camera"]] : [],
    audio: localPeer?.tracks["audio"] ? [localPeer?.tracks["audio"]] : [],
    screenSharing: localPeer?.tracks["screensharing"] ? [localPeer?.tracks["screensharing"]] : [],
    showSimulcast: showSimulcast,
    flipHorizontally: true,
    streamSource: "local",
    playAudio: false,
    mediaPlayerId: LOCAL_VIDEO_ID,
  };

  const { screenSharingStreams, isScreenSharingActive } = prepareScreenSharingStreams(peers, localPeer);
  const noPeers = !peers.length;

  return (
    <div id="videochat" className="grid-wrapper align-center flex h-full w-full justify-center">
      <div
        className={clsx(
          "grid h-full w-full auto-rows-fr gap-3 3xl:max-w-[1728px]",
          isScreenSharingActive && (noPeers ? "relative" : "sm:grid-cols-3/1")
        )}
      >
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
