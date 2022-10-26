import { LocalPeer } from "./hooks/usePeerState";
import VideoPeerPlayersSection, { MediaPlayerConfig } from "./components/StreamPlayer/VideoPeerPlayersSection";
import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";
import ScreenSharingPlayers, { VideoStreamWithMetadata } from "./components/StreamPlayer/ScreenSharingPlayers";
import React, { FC } from "react";
import { UseMediaResult } from "./hooks/useUserMedia";
import { CurrentUser } from "./hooks/useMembraneClient";

type Props = {
  peer?: CurrentUser;
  peers: LocalPeer[];
  displayMedia?: UseMediaResult;
  cameraMedia?: UseMediaResult;
  cameraStreamId?: string;
  audioMedia?: UseMediaResult;
  audioStreamId?: string;
  showSimulcast?: boolean;
  selectRemoteTrackEncoding?: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  disableTrackEncoding?: (trackId: string, encoding: TrackEncoding) => void;
  enableTrackEncoding?: (trackId: string, encoding: TrackEncoding) => void;
};

const prepareScreenSharingStreams = (
  peers: LocalPeer[],
  localStream?: MediaStream
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

  const screenSharingStreams: VideoStreamWithMetadata[] = localStream
    // todo fix peerIcon
    ? [{ videoStream: localStream, peerId: "(Me) screen", videoId: "(Me) screen", peerIcon: "👤", peerName: "(Me) screen" }, ...peersScreenSharingTracks]
    : peersScreenSharingTracks;

  const isScreenSharingActive: boolean = screenSharingStreams.length > 0;
  return { screenSharingStreams, isScreenSharingActive };
};

export const VideochatSection: FC<Props> = ({
  peer,
  peers,
  displayMedia,
  cameraMedia,
  cameraStreamId,
  audioMedia,
  audioStreamId,
  showSimulcast,
  selectRemoteTrackEncoding,
  enableTrackEncoding,
  disableTrackEncoding,
}: Props) => {
  const localUser: MediaPlayerConfig = {
    peerId: peer?.id,
    displayName: "Me",
    emoji: peer?.emoji,
    videoId: cameraStreamId || undefined,
    videoStream: cameraMedia?.stream,
    audioId: audioStreamId || undefined,
    audioStream: audioMedia?.stream,
    screenSharingStream: displayMedia?.stream,
    autoplayAudio: false,
    simulcast: {
      show: showSimulcast,
      // todo POC
      enableTrackEncoding: enableTrackEncoding,
      disableTrackEncoding: disableTrackEncoding,
    },
    flipHorizontally: true,
  };

  const { screenSharingStreams, isScreenSharingActive } = prepareScreenSharingStreams(peers, displayMedia?.stream);

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
