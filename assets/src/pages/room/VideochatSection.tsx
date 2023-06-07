import React, { FC, useMemo } from "react";

import { ApiTrack, RemotePeer } from "./hooks/usePeerState";
import { LOCAL_PEER_NAME, LOCAL_SCREEN_SHARING_ID, LOCAL_VIDEO_ID } from "./consts";
import clsx from "clsx";
import { computeInitials } from "../../features/room-page/components/InitialsImage";

import { MediaPlayerTileConfig, PeerTileConfig, ScreenShareTileConfig, TrackType, TrackWithId } from "../types";
import UnpinnedTilesSection from "./components/StreamPlayer/UnpinnedTilesSection";
import PinnedTilesSection from "./components/StreamPlayer/PinnedTilesSection";
import useTilePinning from "./hooks/useTilePinning";
import { toLocalTrackSelector, toRemotePeerSelector, useSelector } from "../../jellifish.types";

type Props = {
  showSimulcast: boolean;
  unpinnedTilesHorizontal?: boolean;
};

const getTrack = (tracks: ApiTrack[], type: TrackType): TrackWithId | null =>
  tracks
    .filter((track) => track?.metadata?.type === type)
    .map(
      (track): TrackWithId => ({
        stream: track.mediaStream,
        remoteTrackId: track.trackId,
        encodingQuality: track.encoding || null,
        metadata: track.metadata,
        isSpeaking: track.isSpeaking,
        enabled: true,
      })
    )[0] ?? null;

const mapRemotePeersToMediaPlayerConfig = (peers: RemotePeer[]): PeerTileConfig[] => {
  return peers.map((peer: RemotePeer): PeerTileConfig => {
    const videoTrack: TrackWithId | null = getTrack(peer.tracks, "camera");
    const audioTrack: TrackWithId | null = getTrack(peer.tracks, "audio");

    return {
      mediaPlayerId: videoTrack?.remoteTrackId || peer.id,
      typeName: "remote",
      peerId: peer.id,
      displayName: peer.displayName || "Unknown",
      initials: computeInitials(peer.displayName || ""),
      video: videoTrack,
      audio: audioTrack,
      streamSource: "remote",
      isSpeaking: audioTrack?.isSpeaking ?? false,
    };
  });
};

const localPeerToScreenSharingStream = (track: TrackWithId | null): ScreenShareTileConfig => {
  if (!track) {
    throw Error("Something went wrong when parsing ScreenSharing track.");
  }

  return {
    mediaPlayerId: LOCAL_SCREEN_SHARING_ID,
    typeName: "screenShare",
    video: track,
    peerId: track.remoteTrackId ?? "Unknown",
    displayName: LOCAL_PEER_NAME,
    streamSource: "local",
  };
};

const prepareScreenSharingStreams = (
  peers: RemotePeer[],
  localScreenSharing: TrackWithId | null
): ScreenShareTileConfig[] => {
  const peersScreenSharingTracks: ScreenShareTileConfig[] = peers
    .flatMap((peer) =>
      peer.tracks.map((track) => ({
        peerId: peer.id,
        track: track,
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
          encodingQuality: track.encoding || null,
          metadata: track.metadata,
        },
        streamSource: "local",
        mediaPlayerId: track.trackId,
        peerId: peerId,
        displayName: peerName ?? "Unknown",
      })
    );

  return localScreenSharing?.stream
    ? [localPeerToScreenSharingStream(localScreenSharing), ...peersScreenSharingTracks]
    : peersScreenSharingTracks;
};

export const VideochatSection: FC<Props> = ({ showSimulcast, unpinnedTilesHorizontal }: Props) => {
  const video = useSelector((state) => toLocalTrackSelector(state, "camera"));
  const audio = useSelector((state) => toLocalTrackSelector(state, "audio"));
  const screenSharing = useSelector((state) => toLocalTrackSelector(state, "screensharing"));
  const { peerId, initials } = useSelector((state) => ({
    peerId: state?.local?.id || "Unknown",
    initials: computeInitials(state?.local?.metadata?.name || ""),
  }));

  const localUser: PeerTileConfig = {
    typeName: "local",
    peerId,
    displayName: LOCAL_PEER_NAME,
    initials,
    video: video,
    audio: audio,
    streamSource: "local",
    mediaPlayerId: LOCAL_VIDEO_ID,
    isSpeaking: false,
  };

  const peers: RemotePeer[] = useSelector((state) => toRemotePeerSelector(state));
  const screenSharingStreams = prepareScreenSharingStreams(peers, screenSharing);

  const allPeersConfig: MediaPlayerTileConfig[] = [localUser, ...mapRemotePeersToMediaPlayerConfig(peers)];
  const allTilesConfig: MediaPlayerTileConfig[] = allPeersConfig.concat(screenSharingStreams);

  const { pinTile, unpinTile, pinningFlags, pinnedTilesIds, unpinnedTilesIds } = useTilePinning();

  const {
    pinnedTiles,
    unpinnedTiles,
  }: {
    pinnedTiles: MediaPlayerTileConfig[];
    unpinnedTiles: MediaPlayerTileConfig[];
  } = useMemo(
    () => ({
      pinnedTiles: allTilesConfig.filter((tile) => pinnedTilesIds.includes(tile.mediaPlayerId)),
      unpinnedTiles: allTilesConfig.filter((tile) => unpinnedTilesIds.includes(tile.mediaPlayerId)),
    }),
    [pinnedTilesIds, unpinnedTilesIds, allTilesConfig]
  );

  const wrapperClass = useMemo(() => {
    const areAllTilesPinned = !pinningFlags.isAnyUnpinned;

    const base = "grid h-full w-full auto-rows-fr gap-3 3xl:max-w-[3200px]";
    const unpinnedTilesLayout = unpinnedTilesHorizontal ? "sm:grid-rows-3/1" : "sm:grid-cols-3/1";
    const layoutWithTileHighlight = allTilesConfig.length === 2 || areAllTilesPinned ? "relative" : unpinnedTilesLayout;

    return clsx(base, pinningFlags.isAnyPinned && layoutWithTileHighlight);
  }, [unpinnedTilesHorizontal, allTilesConfig.length, pinningFlags.isAnyPinned, pinningFlags.isAnyUnpinned]);

  const forceEncoding = allTilesConfig.length <= 2 ? "h" : undefined;

  return (
    <div id="videochat" className="grid-wrapper align-center flex h-full w-full justify-center">
      <div className={wrapperClass}>
        {pinningFlags.isAnyPinned && (
          <PinnedTilesSection
            pinnedTiles={pinnedTiles}
            unpin={unpinTile}
            showSimulcast={showSimulcast}
            forceEncoding={forceEncoding}
          />
        )}

        {pinningFlags.isAnyUnpinned && (
          <UnpinnedTilesSection
            tileConfigs={unpinnedTiles}
            showSimulcast={showSimulcast}
            isAnyTilePinned={pinningFlags.isAnyPinned}
            pin={pinTile}
            videoInVideo={pinnedTiles.length === 1}
            blockPinning={pinningFlags.blockPinning}
            forceEncoding={forceEncoding}
            horizontal={!!unpinnedTilesHorizontal}
          />
        )}
      </div>
    </div>
  );
};
