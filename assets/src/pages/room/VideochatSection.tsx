import { LocalPeer, RemotePeer } from "./hooks/usePeerState";
import VideoPeerPlayersSection, { MediaPlayerConfig } from "./components/StreamPlayer/VideoPeerPlayersSection";
import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";
import ScreenSharingPlayers, { VideoStreamWithMetadata } from "./components/StreamPlayer/ScreenSharingPlayers";
import React, { FC } from "react";
import { UseMediaResult } from "./hooks/useUserMedia";
import { CurrentUser } from "./hooks/useMembraneClient";

type Props = {
  peers: RemotePeer[];
  localPeer?: LocalPeer;
  showSimulcast?: boolean;
  selectRemoteTrackEncoding?: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  disableTrackEncoding?: (trackId: string, encoding: TrackEncoding) => void;
  enableTrackEncoding?: (trackId: string, encoding: TrackEncoding) => void;
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
    .filter((e) => e.track?.metadata?.type === "screensharing")
    // todo fix now - should videoId be e.track?.trackId?
    .map((e) => ({
      videoStream: e.track.mediaStream,
      peerId: e.peerId,
      videoId: e.track?.mediaStreamTrack?.id,
      peerIcon: e.emoji,
      peerName: e.peerName,
    }));

  const screenSharingStreams: VideoStreamWithMetadata[] = localPeer?.screenSharingTrackStream
    ? [
        {
          videoStream: localPeer?.screenSharingTrackStream,
          peerId: localPeer?.id,
          videoId: localPeer?.screenSharingTrackId,
          peerIcon: localPeer?.metadata?.emoji,
          peerName: "Me",
        },
        ...peersScreenSharingTracks,
      ]
    : peersScreenSharingTracks;

  const isScreenSharingActive: boolean = screenSharingStreams.length > 0;
  return { screenSharingStreams, isScreenSharingActive };
};

export const VideochatSection: FC<Props> = ({
  peers,
  localPeer,
  showSimulcast,
  selectRemoteTrackEncoding,
  enableTrackEncoding,
  disableTrackEncoding,
}: Props) => {
  const localUser: MediaPlayerConfig = {
    peerId: localPeer?.id,
    displayName: "Me",
    emoji: localPeer?.metadata?.emoji,
    videoId: localPeer?.videoTrackId,
    videoStream: localPeer?.videoTrackStream,
    audioId: localPeer?.audioTrackId,
    audioStream: localPeer?.audioTrackStream,
    screenSharingStream: localPeer?.screenSharingTrackStream,
    autoplayAudio: false,
    simulcast: {
      show: showSimulcast,
      // todo POC
      enableTrackEncoding: enableTrackEncoding,
      disableTrackEncoding: disableTrackEncoding,
    },
    flipHorizontally: true,
  };

  const { screenSharingStreams, isScreenSharingActive } = prepareScreenSharingStreams(peers, localPeer);

  return (
    <div id="videochat" className="px-2 md:px-20 overflow-y-auto">
      <div className="flex flex-col items-center md:flex-row md:items-start justify-center h-full">
        {isScreenSharingActive && <ScreenSharingPlayers streams={screenSharingStreams || []} />}

        <VideoPeerPlayersSection
          peers={peers}
          localUser={localUser}
          showSimulcast={showSimulcast}
          selectRemoteTrackEncoding={selectRemoteTrackEncoding}
          oneColumn={isScreenSharingActive}
        />
      </div>
    </div>
  );
};
