import React, { FC, useEffect, useMemo } from "react";

import { ApiTrack, LocalPeer, RemotePeer } from "./hooks/usePeerState";
import { MembraneWebRTC } from "@jellyfish-dev/membrane-webrtc-js";
import { LOCAL_PEER_NAME, LOCAL_SCREEN_SHARING_ID, LOCAL_VIDEO_ID } from "./consts";
import clsx from "clsx";
import { computeInitials } from "../../features/room-page/components/InitialsImage";
import usePinning from "./hooks/usePinning";

import { PeerTileConfig, MediaPlayerTileConfig, ScreenShareTileConfig, TrackType, TrackWithId } from "../types";
import UnpinnedTilesSection from "./components/StreamPlayer/UnpinnedTilesSection";
import PinnedTilesSection from "./components/StreamPlayer/PinnedTilesSection";
import { groupBy } from "./utils";
import { remoteTrackToLocalTrack } from "../../features/room-page/utils/remoteTrackToLocalTrack";

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

const mapRemotePeersToMediaPlayerConfig = (peers: RemotePeer[]): PeerTileConfig[] => {
  return peers.map((peer: RemotePeer): PeerTileConfig => {
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

const takeOutPinnedTiles = (
  tiles: MediaPlayerTileConfig[],
  pinnedTileIds: string[]
): { pinnedTiles: MediaPlayerTileConfig[]; unpinnedTiles: MediaPlayerTileConfig[] } => {
  const { pinnedTiles, unpinnedTiles } = groupBy(tiles, ({ mediaPlayerId }) =>
    pinnedTileIds.includes(mediaPlayerId) ? "pinnedTiles" : "unpinnedTiles"
  );
  return { pinnedTiles: pinnedTiles ?? [], unpinnedTiles: unpinnedTiles ?? [] };
};

const pinNewScreenShares = (
  screenSharingStreams: ScreenShareTileConfig[],
  pinIfNotAlreadyPinned: (tileId: string) => void
) => {
  screenSharingStreams.map((tile) => tile.mediaPlayerId).forEach(pinIfNotAlreadyPinned);
};

const pinSecondUser = (
  mediaPlayerTiles: MediaPlayerTileConfig[],
  pinIfNotAlreadyPinned: (tileId: string) => void
): void => {
  if (mediaPlayerTiles.length === 2) {
    const localUserTile = mediaPlayerTiles.find((tile) => tile.streamSource === "local");
    const remoteUserTile = mediaPlayerTiles.find((tile) => tile.streamSource === "remote");
    localUserTile && remoteUserTile && pinIfNotAlreadyPinned(remoteUserTile.mediaPlayerId);
  }
};

export const VideochatSection: FC<Props> = ({ peers, localPeer, showSimulcast, webrtc }: Props) => {
  const video: TrackWithId | null = remoteTrackToLocalTrack(localPeer?.tracks["camera"]);
  const audio: TrackWithId | null = remoteTrackToLocalTrack(localPeer?.tracks["audio"]);

  const localUser: PeerTileConfig = {
    typeName: "local",
    peerId: localPeer?.id ?? "Unknown",
    displayName: LOCAL_PEER_NAME,
    initials: computeInitials(localPeer?.metadata?.displayName || ""),
    video: video,
    audio: audio,
    streamSource: "local",
    mediaPlayerId: LOCAL_VIDEO_ID,
  };

  const pinningApi = usePinning();
  const screenSharingStreams = prepareScreenSharingStreams(peers, localPeer);

  const allPeersConfig: MediaPlayerTileConfig[] = [localUser, ...mapRemotePeersToMediaPlayerConfig(peers)];
  const allTilesConfig: MediaPlayerTileConfig[] = allPeersConfig.concat(screenSharingStreams);

  useEffect(() => {
    pinNewScreenShares(screenSharingStreams, pinningApi.pinIfNotAlreadyPinned);
    pinSecondUser(allTilesConfig, pinningApi.pinIfNotAlreadyPinned);
  });

  const { pinnedTiles, unpinnedTiles } = takeOutPinnedTiles(allTilesConfig, pinningApi.pinnedTileIds);
  const isAnyTilePinned = pinnedTiles.length > 0;
  const isAnyTileUnpinned = unpinnedTiles.length > 0;

  const wrapperClass = useMemo(() => {
    const areAllTilesPinned = unpinnedTiles.length === 0;

    const base = "grid h-full w-full auto-rows-fr gap-3 3xl:max-w-[3200px]";
    const layoutWithTileHighlight = allTilesConfig.length === 2 || areAllTilesPinned ? "relative" : "sm:grid-cols-3/1";

    return clsx(base, isAnyTilePinned && layoutWithTileHighlight);
  }, [isAnyTilePinned, allTilesConfig.length, unpinnedTiles.length]);

  const shouldBlockPinning = allTilesConfig.length === 1;
  return (
    <div id="videochat" className="grid-wrapper align-center flex h-full w-full justify-center">
      <div className={wrapperClass}>
        {isAnyTilePinned && (
          <PinnedTilesSection
            pinnedTiles={pinnedTiles}
            unpin={pinningApi.unpin}
            showSimulcast={showSimulcast}
            webrtc={webrtc}
          />
        )}

        {isAnyTileUnpinned && (
          <UnpinnedTilesSection
            tileConfigs={unpinnedTiles}
            showSimulcast={showSimulcast}
            oneColumn={isAnyTilePinned}
            webrtc={webrtc}
            pin={pinningApi.pin}
            videoInVideo={pinnedTiles.length === 1}
            blockPinning={shouldBlockPinning}
          />
        )}
      </div>
    </div>
  );
};
