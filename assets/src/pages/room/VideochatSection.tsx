import React, { FC, useMemo } from "react";

import { ApiTrack, LocalPeer, RemotePeer } from "./hooks/usePeerState";
import { MembraneWebRTC } from "@jellyfish-dev/membrane-webrtc-js";
import { LOCAL_PEER_NAME, LOCAL_SCREEN_SHARING_ID, LOCAL_VIDEO_ID } from "./consts";
import clsx from "clsx";
import { computeInitials } from "../../features/room-page/components/InitialsImage";

import { PeerTileConfig, MediaPlayerTileConfig, ScreenShareTileConfig, TrackType, TrackWithId } from "../types";
import UnpinnedTilesSection from "./components/StreamPlayer/UnpinnedTilesSection";
import PinnedTilesSection from "./components/StreamPlayer/PinnedTilesSection";
import { remoteTrackToLocalTrack } from "../../features/room-page/utils/remoteTrackToLocalTrack";
import useTilePinning from "./hooks/useTilePinning";

type Props = {
  peers: RemotePeer[];
  localPeer?: LocalPeer;
  showSimulcast?: boolean;
  webrtc?: MembraneWebRTC;
  unpinnedTilesHorizontal?: boolean;
};

const getTrack = (tracks: ApiTrack[], type: TrackType): TrackWithId | null =>
  tracks
    .filter((track) => track?.metadata?.type === type)
    .map(
      (track): TrackWithId => ({
        stream: track.mediaStream,
        remoteTrackId: track.trackId,
        encodingQuality: track.encoding,
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
      mediaPlayerId: peer.id,
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

export const VideochatSection: FC<Props> = ({
  peers,
  localPeer,
  showSimulcast,
  webrtc,
  unpinnedTilesHorizontal,
}: Props) => {
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
    isSpeaking: false,
  };

  const screenSharingStreams = prepareScreenSharingStreams(peers, localPeer);

  const allPeersConfig: MediaPlayerTileConfig[] = [localUser, ...mapRemotePeersToMediaPlayerConfig(peers)];
  const allTilesConfig: MediaPlayerTileConfig[] = allPeersConfig.concat(screenSharingStreams);

  const { pinnedTiles, unpinnedTiles, pinTile, unpinTile, pinningFlags } = useTilePinning(allTilesConfig);

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
            webrtc={webrtc}
            forceEncoding={forceEncoding}
          />
        )}

        {pinningFlags.isAnyUnpinned && (
          <UnpinnedTilesSection
            tileConfigs={unpinnedTiles}
            showSimulcast={showSimulcast}
            isAnyTilePinned={pinningFlags.isAnyPinned}
            webrtc={webrtc}
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
