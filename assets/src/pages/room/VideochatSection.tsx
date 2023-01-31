import { LocalPeer, RemotePeer, Track } from "./hooks/usePeerState";
import MediaPlayerPeersSection, {
  MediaPlayerTileConfig,
  TrackWithId,
} from "./components/StreamPlayer/MediaPlayerPeersSection";
// import { MembraneWebRTC } from "@jellyfish-dev/membrane-webrtc-js";
import ScreenSharingPlayers, { VideoStreamWithMetadata } from "./components/StreamPlayer/ScreenSharingPlayers";
import React, { FC } from "react";
import { LOCAL_PEER_NAME, LOCAL_SCREEN_SHARING_ID, LOCAL_VIDEO_ID } from "./consts";
import { UseMembraneClientType } from "../../library/types";
import { PeerMetadata, TrackMetadata } from "../../libraryUsage/types";

type Props = {
  // peers: RemotePeer[];
  // localPeer?: LocalPeer;
  // showSimulcast?: boolean;
  // showDeveloperInfo?: boolean;
  // webrtc?: MembraneWebRTC;
  clientWrapper: UseMembraneClientType<PeerMetadata, TrackMetadata>;
};

const localPeerToScreenSharingStream = (localPeer: LocalPeer): VideoStreamWithMetadata => {
  const videoTrack = remoteTrackToLocalTrack(localPeer?.tracks["screensharing"]);

  if (!videoTrack) {
    throw Error("Something went wrong when parsing ScreenSharing track.");
  }

  return {
    video: videoTrack,
    peerId: localPeer?.id,
    peerIcon: localPeer?.metadata?.emoji,
    peerName: LOCAL_PEER_NAME,
    mediaPlayerId: LOCAL_SCREEN_SHARING_ID,
  };
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
    ? [localPeerToScreenSharingStream(localPeer), ...peersScreenSharingTracks]
    : peersScreenSharingTracks;

  const isScreenSharingActive: boolean = screenSharingStreams.length > 0;
  return { screenSharingStreams, isScreenSharingActive };
};

const remoteTrackToLocalTrack = (localPeer: Track | undefined): TrackWithId | null =>
  localPeer ? { ...localPeer, remoteTrackId: localPeer.trackId } : null;

export const VideochatSection: FC<Props> = ({ clientWrapper }: Props) => {
  // const video: TrackWithId | null = remoteTrackToLocalTrack(localPeer?.tracks["camera"]);
  // const audio: TrackWithId | null = remoteTrackToLocalTrack(localPeer?.tracks["audio"]);
  // const screenSharing: TrackWithId | null = remoteTrackToLocalTrack(localPeer?.tracks["screensharing"]);

  // const localUser: MediaPlayerTileConfig = {
  //   peerId: localPeer?.id,
  //   displayName: LOCAL_PEER_NAME,
  //   emoji: localPeer?.metadata?.emoji,
  //   video: video ? [video] : [],
  //   audio: audio ? [audio] : [],
  //   screenSharing: screenSharing ? [screenSharing] : [],
  //   showSimulcast: showSimulcast,
  //   flipHorizontally: true,
  //   streamSource: "local",
  //   playAudio: false,
  //   mediaPlayerId: LOCAL_VIDEO_ID,
  // };

  // const { screenSharingStreams, isScreenSharingActive } = prepareScreenSharingStreams(peers, localPeer);

  return (
    <div id="videochat" className="overflow-y-auto">
      <div className="grid-wrapper flex h-full flex-col items-center justify-start md:flex-row md:items-start">
        {/*{isScreenSharingActive && <ScreenSharingPlayers streams={screenSharingStreams || []} />}*/}

        <MediaPlayerPeersSection
          clientWrapper={clientWrapper}
          // peers={peers}
          // localUser={localUser}
          // showSimulcast={showSimulcast}
          // showDeveloperInfo={showDeveloperInfo}
          oneColumn={false}
          // webrtc={webrtc}
        />
      </div>
    </div>
  );
};
