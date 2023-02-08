import React, { FC, useCallback } from "react";

import { ApiTrack, LocalPeer, RemotePeer, Track } from "./hooks/usePeerState";
import { MembraneWebRTC } from "@jellyfish-dev/membrane-webrtc-js";
import { LOCAL_PEER_NAME, LOCAL_SCREEN_SHARING_ID, LOCAL_VIDEO_ID } from "./consts";
import clsx from "clsx";
import { computeInitials } from "../../features/room-page/components/InitialsImage";
import usePinning from "../../features/room-page/utils/usePinning";
import {
  LocalTileConfig,
  MediaPlayerTileConfig,
  RemoteTileConfig,
  ScreenShareTileConfig,
  TrackType,
  TrackWithId,
} from "../types";
import MediaPlayerTile from "./components/StreamPlayer/MediaPlayerTile";
import { PinIndicator, PinTileButton } from "../../features/room-page/components/PinComponents";
import NameTag from "../../features/room-page/components/NameTag";
import PeerInfoLayer from "./components/StreamPlayer/PeerInfoLayer";
import UnpinnedTilesSection from "./components/StreamPlayer/UnpinnedTilesSection";
import PinnedTilesSection from "./components/StreamPlayer/PinnedTilesSection";

type Props = {
  peers: RemotePeer[];
  localPeer?: LocalPeer;
  showSimulcast?: boolean;
  webrtc?: MembraneWebRTC;
};

const getTrack = (tracks: ApiTrack[], type: TrackType): TrackWithId =>
  tracks
    .filter((track) => track?.metadata?.type === type)
    .map(
      (track): TrackWithId => ({
        stream: track.mediaStream,
        remoteTrackId: track.trackId,
        encodingQuality: track.encoding,
        metadata: track.metadata,
        enabled: true,
      })
    )[0];

const mapRemotePeersToMediaPlayerConfig = (peers: RemotePeer[]): RemoteTileConfig[] => {
  return peers.map((peer: RemotePeer): RemoteTileConfig => {
    const videoTrack: TrackWithId = getTrack(peer.tracks, "camera");
    const audioTrack: TrackWithId = getTrack(peer.tracks, "audio");

    return {
      mediaPlayerId: peer.id,
      typeName: "remote",
      peerId: peer.id,
      displayName: peer.displayName || "Unknown",
      initials: computeInitials(peer.displayName || ""),
      video: videoTrack,
      audio: audioTrack,
      streamSource: "remote",
    };
  });
};

const localPeerToScreenSharingStream = (localPeer: LocalPeer): ScreenShareTileConfig => {
  const videoTrack = remoteTrackToLocalTrack(localPeer?.tracks["screensharing"]);

  if (!videoTrack) {
    throw Error("Something went wrong when parsing ScreenSharing track.");
  }

  return {
    mediaPlayerId: LOCAL_SCREEN_SHARING_ID,
    typeName: "screenShare",
    video: videoTrack,
    peerId: localPeer?.id ?? "Unknown",
    displayName: LOCAL_PEER_NAME,
    streamSource: "local",
  };
};

const prepareScreenSharingStreams = (peers: RemotePeer[], localPeer?: LocalPeer): ScreenShareTileConfig[] => {
  const peersScreenSharingTracks: ScreenShareTileConfig[] = peers
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
      ({ track, peerId, peerName }): ScreenShareTileConfig => ({
        typeName: "screenShare",
        video: {
          stream: track.mediaStream,
          remoteTrackId: track.trackId,
          encodingQuality: track.encoding,
          metadata: track.metadata,
        },
        streamSource: "local",
        mediaPlayerId: track.trackId,
        peerId: peerId,
        displayName: peerName ?? "Unknown",
      })
    );

  const screenSharingStreams: ScreenShareTileConfig[] = localPeer?.tracks["screensharing"]?.stream
    ? [localPeerToScreenSharingStream(localPeer), ...peersScreenSharingTracks]
    : peersScreenSharingTracks;

  return screenSharingStreams;
};

const remoteTrackToLocalTrack = (localPeer: Track | undefined): TrackWithId | null =>
  localPeer ? { ...localPeer, remoteTrackId: localPeer.trackId } : null;

const takeOutPinnedTile = (
  tiles: MediaPlayerTileConfig[],
  pinnedTileId: string
): { pinnedTile: MediaPlayerTileConfig | null; restTiles: MediaPlayerTileConfig[] } => {
  const pinnedTile = tiles.find((tile) => tile.mediaPlayerId === pinnedTileId) ?? null;
  const restTiles = tiles.filter((tile) => tile.mediaPlayerId !== pinnedTileId);
  return { pinnedTile, restTiles };
};

export const VideochatSection: FC<Props> = ({ peers, localPeer, showSimulcast, webrtc }: Props) => {
  const video: TrackWithId | null = remoteTrackToLocalTrack(localPeer?.tracks["camera"]);
  const audio: TrackWithId | null = remoteTrackToLocalTrack(localPeer?.tracks["audio"]);

  const localUser: LocalTileConfig = {
    typeName: "local",
    peerId: localPeer?.id ?? "Unknown",
    displayName: LOCAL_PEER_NAME,
    initials: computeInitials(localPeer?.metadata?.displayName || ""),
    video: video,
    audio: audio,
    streamSource: "local",
    mediaPlayerId: LOCAL_VIDEO_ID,
  };

  const screenSharingStreams = prepareScreenSharingStreams(peers, localPeer);

  const allPeersConfig: MediaPlayerTileConfig[] = [localUser, ...mapRemotePeersToMediaPlayerConfig(peers)];
  const allTilesConfig: MediaPlayerTileConfig[] = allPeersConfig.concat(screenSharingStreams);

  const pinningApi = usePinning();
  const { pinnedTile, restTiles } = takeOutPinnedTile(allTilesConfig, pinningApi.pinnedTileId);
  const isSomeTilePinned = !!pinnedTile;

  const getWrapperClass = useCallback(() => {
    const base = "grid h-full w-full auto-rows-fr gap-3 3xl:max-w-[1728px]";
    const layoutWithTileHighlight = peers.length === 0 ? "relative" : "sm:grid-cols-3/1";

    return clsx(base, isSomeTilePinned && layoutWithTileHighlight);
  }, [isSomeTilePinned]);

  return (
    <div id="videochat" className="grid-wrapper align-center flex h-full w-full justify-center">
      <div className={getWrapperClass()}>
        {pinnedTile && (
          <PinnedTilesSection
            pinnedTile={pinnedTile}
            unpin={pinningApi.unpin}
            showSimulcast={showSimulcast}
            webrtc={webrtc}
          />
        )}

        <UnpinnedTilesSection
          tileConfigs={restTiles}
          showSimulcast={showSimulcast}
          oneColumn={isSomeTilePinned}
          webrtc={webrtc}
          pinningApi={pinningApi}
          blockPinning={allTilesConfig.length === 1}
        />
      </div>
    </div>
  );
};
