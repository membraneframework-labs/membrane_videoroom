import React, { FC } from "react";
import { ApiTrack, RemotePeer } from "../../hooks/usePeerState";
import MediaPlayerTile from "./MediaPlayerTile";
import { MembraneWebRTC, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import clsx from "clsx";
import { StreamSource, TrackType } from "../../../types";
import PeerInfoLayer from "./PeerInfoLayer";
import MicrophoneOff from "../../../../features/room-page/icons/MicrophoneOff";
import { getGridConfig } from "../../../../features/room-page/utils/getVideoGridConfig";
import NameTag from "../../../../features/room-page/components/NameTag";
import InitialsImage, { computeInitials } from "../../../../features/room-page/components/InitialsImage";
import { LibraryTrackMinimal } from "../../../../library/state.types";
import { useSelector } from "../../../../libraryUsage/setup";
import {
  createLocalPeerGuiSelector,
  createLocalTracksRecordSelector,
  PeerGui
} from "../../../../libraryUsage/customSelectors";
import { UseSimulcastLocalEncoding, useSimulcastSend } from "../../hooks/useSimulcastSend";

export type TrackWithId = {
  stream?: MediaStream;
  remoteTrackId: string | null;
  encodingQuality?: TrackEncoding;
  metadata?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  enabled?: boolean;
};

export type MediaPlayerTileConfig = {
  mediaPlayerId: string;
  peerId?: string;
  displayName?: string;
  initials: string;
  video: TrackWithId[];
  audio: TrackWithId[];
  playAudio: boolean;
  streamSource: StreamSource;
  flipHorizontally?: boolean;
};

const getTracks = (tracks: ApiTrack[], type: TrackType): TrackWithId[] =>
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
    );

const mapRemotePeersToMediaPlayerConfig = (peers: RemotePeer[]): MediaPlayerTileConfig[] => {
  return peers.map((peer: RemotePeer): MediaPlayerTileConfig => {
    const videoTracks: TrackWithId[] = getTracks(peer.tracks, "camera");
    const audioTracks: TrackWithId[] = getTracks(peer.tracks, "audio");

    return {
      peerId: peer.id,
      displayName: peer.displayName,
      initials: computeInitials(peer.displayName || ""),
      video: videoTracks,
      audio: audioTracks,
      flipHorizontally: false,
      streamSource: "remote",
      playAudio: true,
      mediaPlayerId: peer.id,
    };
  });
};

type DisabledMicIconProps = {
  isLoading: boolean;
};

const DisabledMicIcon = ({ isLoading }: DisabledMicIconProps) => {
  return (
    <div className="flex h-8 w-8 flex-wrap content-center justify-center rounded-full bg-white">
      <MicrophoneOff className={isLoading ? "animate-spin" : ""} fill="#001A72" />
    </div>
  );
};

type Props = {
  peers: RemotePeer[];
  localUser: MediaPlayerTileConfig;
  showSimulcast?: boolean;
  selectRemoteTrackEncoding?: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  oneColumn?: boolean; // screensharing or pinned user
  webrtc?: MembraneWebRTC;
};

const isLoading = (track: TrackWithId) => track?.stream === undefined && track?.metadata?.active === true;
export const showDisabledIcon = (track: TrackWithId) => track?.stream === undefined || track?.metadata?.active === false;

const MediaPlayerPeersSectionOld: FC<Props> = ({ peers, localUser, showSimulcast, oneColumn, webrtc }: Props) => {
  const tracks: Partial<Record<TrackType, LibraryTrackMinimal>> = useSelector(createLocalTracksRecordSelector());
  const peer: PeerGui | null = useSelector(createLocalPeerGuiSelector());
  const localEncoding: UseSimulcastLocalEncoding = useSimulcastSend(tracks.camera?.trackId || null);

  const allPeersConfig: MediaPlayerTileConfig[] = [localUser, ...mapRemotePeersToMediaPlayerConfig(peers)];
  const gridConfig = getGridConfig(allPeersConfig.length);

  const getGridStyle = () => {
    const noPeers = !peers.length;

    if (oneColumn) {
      if (noPeers) {
        // display video positioned absolute in another video
        return "absolute bottom-4 right-4 z-10 h-[220px] w-[400px]";
      } else {
        return "grid flex-1 grid-flow-row auto-rows-fr grid-cols-1 gap-y-3";
      }
    } else {
      return clsx(gridConfig.columns, gridConfig.grid, gridConfig.gap, gridConfig.padding, gridConfig.rows);
    }
  };

  const videoGridStyle = getGridStyle();
  const tileSize = allPeersConfig.length >= 7 ? "M" : "L";

  return (
    <div id="videos-grid" className={clsx("h-full w-full", videoGridStyle)}>
      {allPeersConfig.map((config) => {
        // todo for now only first audio, video and screen sharing stream are handled
        const video: TrackWithId | undefined = config.video[0];
        const audio: TrackWithId | undefined = config.audio[0];

        return (
          <MediaPlayerTile
            key={config.mediaPlayerId}
            peerId={config.peerId}
            video={video}
            audioStream={audio?.stream}
            className={!oneColumn ? clsx(gridConfig.span, gridConfig.tileClass) : undefined}
            layers={
              <>
                {showDisabledIcon(video) ? <InitialsImage initials={config.initials} /> : null}
                <PeerInfoLayer
                  bottomLeft={<NameTag name={config.displayName || "Unknown"} />}
                  topLeft={
                    <div className="flex flex-row items-center gap-x-2 text-xl">
                      {showDisabledIcon(audio) && <DisabledMicIcon isLoading={isLoading(audio)} />}
                    </div>
                  }
                  tileSize={tileSize}
                />
              </>
            }
            showSimulcast={showSimulcast}
            streamSource={config.streamSource}
            flipHorizontally={config.flipHorizontally}
            webrtc={webrtc}
            playAudio={config.playAudio}
          />
        );
      })}
    </div>
  );
};

export default MediaPlayerPeersSectionOld;
