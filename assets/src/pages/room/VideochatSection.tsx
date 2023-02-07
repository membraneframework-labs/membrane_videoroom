import React, { FC, useCallback, useState } from "react";

import { LocalPeer, RemotePeer, Track } from "./hooks/usePeerState";
import MediaPlayerPeersSection, {
  MediaPlayerTileConfig,
  TrackWithId,
} from "./components/StreamPlayer/MediaPlayerPeersSection";
import { MembraneWebRTC } from "@jellyfish-dev/membrane-webrtc-js";
import ScreenSharingPlayers, { VideoStreamWithMetadata } from "./components/StreamPlayer/ScreenSharingPlayers";
import { LOCAL_PEER_NAME, LOCAL_SCREEN_SHARING_ID, LOCAL_VIDEO_ID } from "./consts";
import clsx from "clsx";
import { computeInitials } from "../../features/room-page/components/InitialsImage";
import usePinning from "../../features/room-page/utils/usePinning";

type Props = {
  peers: RemotePeer[];
  localPeer?: LocalPeer;
  showSimulcast?: boolean;
  webrtc?: MembraneWebRTC;
};

const localPeerToScreenSharingStream = (localPeer: LocalPeer): MediaPlayerTileConfig => {
  const videoTrack = remoteTrackToLocalTrack(localPeer?.tracks["screensharing"]);

  if (!videoTrack) {
    throw Error("Something went wrong when parsing ScreenSharing track.");
  }

  return {
    video: [videoTrack],
    peerId: localPeer?.id,
    displayName: LOCAL_PEER_NAME,
    initials: computeInitials(localPeer.metadata?.displayName || ""),
    mediaPlayerId: LOCAL_SCREEN_SHARING_ID,
    audio: [],
    playAudio: false,
    streamSource: "local",
  };
};

const prepareScreenSharingStreams = (
  peers: RemotePeer[],
  localPeer?: LocalPeer
): MediaPlayerTileConfig[] => {
  const peersScreenSharingTracks: MediaPlayerTileConfig[] = peers
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
      ({ track, peerId, peerName }): MediaPlayerTileConfig => ({
        video: [{
          stream: track.mediaStream,
          remoteTrackId: track.trackId,
          encodingQuality: track.encoding,
          metadata: track.metadata,
        }],
        audio: [],
        playAudio: false,
        streamSource: "local",
        mediaPlayerId: track.trackId,
        peerId: peerId,
        displayName: peerName,
        initials: computeInitials(peerName || ""),
      })
    );

  const screenSharingStreams: MediaPlayerTileConfig[] = localPeer?.tracks["screensharing"]?.stream
    ? [localPeerToScreenSharingStream(localPeer), ...peersScreenSharingTracks]
    : peersScreenSharingTracks;

  return screenSharingStreams;
};

const remoteTrackToLocalTrack = (localPeer: Track | undefined): TrackWithId | null =>
  localPeer ? { ...localPeer, remoteTrackId: localPeer.trackId } : null;

export const VideochatSection: FC<Props> = ({ peers, localPeer, showSimulcast, webrtc }: Props) => {
  const video: TrackWithId | null = remoteTrackToLocalTrack(localPeer?.tracks["camera"]);
  const audio: TrackWithId | null = remoteTrackToLocalTrack(localPeer?.tracks["audio"]);

  const localUser: MediaPlayerTileConfig = {
    peerId: localPeer?.id,
    displayName: LOCAL_PEER_NAME,
    initials: computeInitials(localPeer?.metadata?.displayName || ""),
    video: video ? [video] : [],
    audio: audio ? [audio] : [],
    flipHorizontally: true,
    streamSource: "local",
    playAudio: false,
    mediaPlayerId: LOCAL_VIDEO_ID,
  };

  const screenSharingStreams = prepareScreenSharingStreams(peers, localPeer);

  const pinningApi = usePinning();
  const isSomeTilePinned = !!pinningApi.pinnedTileId;

  const getWrapperClass = useCallback(() => {
    const base = "grid h-full w-full auto-rows-fr gap-3 3xl:max-w-[1728px]";
    const layoutWithTileHighlight = peers.length === 0 ? "relative" : "sm:grid-cols-3/1";

    return clsx(base, isSomeTilePinned && layoutWithTileHighlight)
  }, [isSomeTilePinned]);

  return (
    <div id="videochat" className="grid-wrapper align-center flex h-full w-full justify-center">
      <div
        className={getWrapperClass()}
      >
        {/* {isSomeTilePinned && <ScreenSharingPlayers streams={screenSharingStreams || []} pinningApi={pinningApi}/>} */}

        <MediaPlayerPeersSection
          peers={peers}
          localUser={localUser}
          screenShareConfigs={screenSharingStreams}
          showSimulcast={showSimulcast}
          // oneColumn={isScreenSharingActive}
          webrtc={webrtc}
          pinningApi={pinningApi}
        />
      </div>
    </div>
  );
};
