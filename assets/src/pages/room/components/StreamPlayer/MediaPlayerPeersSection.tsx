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

export type TrackWithId = {
  stream?: MediaStream;
  remoteTrackId?: string;
  encodingQuality?: TrackEncoding;
  metadata?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  enabled?: boolean;
};

export type MediaPlayerTileConfig = {
  peerId?: string;
  flipHorizontally?: boolean;
  displayName?: string;
  initials: string;
  video: TrackWithId[];
  audio: TrackWithId[];
  playAudio: boolean;
  screenSharing: TrackWithId[];
  showSimulcast?: boolean;
  remoteSimulcast?: boolean;
  streamSource: StreamSource;
  mediaPlayerId: string;
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

const mapRemotePeersToMediaPlayerConfig = (peers: RemotePeer[], showSimulcast?: boolean): MediaPlayerTileConfig[] => {
  return peers.map((peer: RemotePeer): MediaPlayerTileConfig => {
    const videoTracks: TrackWithId[] = getTracks(peer.tracks, "camera");
    const audioTracks: TrackWithId[] = getTracks(peer.tracks, "audio");
    const screenSharingTracks: TrackWithId[] = getTracks(peer.tracks, "screensharing");

    return {
      peerId: peer.id,
      displayName: peer.displayName,
      initials: computeInitials(peer.displayName || ""),
      video: videoTracks,
      audio: audioTracks,
      screenSharing: screenSharingTracks,
      showSimulcast: showSimulcast,
      flipHorizontally: false,
      remoteSimulcast: true,
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
  showDeveloperInfo?: boolean;
  selectRemoteTrackEncoding?: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  oneColumn?: boolean; // screensharing or pinned user
  webrtc?: MembraneWebRTC;
};

const isLoading = (track: TrackWithId) => track?.stream === undefined && track?.metadata?.active === true;
const showDisabledIcon = (track: TrackWithId) => track?.stream === undefined || track?.metadata?.active === false;

const MediaPlayerPeersSection: FC<Props> = ({
  peers,
  localUser,
  showSimulcast,
  oneColumn,
  webrtc,
  showDeveloperInfo,
}: Props) => {
  const allPeersConfig: MediaPlayerTileConfig[] = [
    localUser,
    ...mapRemotePeersToMediaPlayerConfig(peers, showSimulcast),
  ];

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

  const gridConfig = getGridConfig(allPeersConfig.length);
  const videoGridStyle = getGridStyle();
  const tileSize = allPeersConfig.length >= 7 ? "M" : "L";

  return (
    <div id="videos-grid" className={clsx("h-full w-full", videoGridStyle)}>
      {allPeersConfig.map((config) => {
        // todo for now only first audio, video and screen sharing stream are handled
        const video: TrackWithId | undefined = config.video[0];
        const screenSharing: TrackWithId | undefined = config.screenSharing[0];
        const audio: TrackWithId | undefined = config.audio[0];

        const localAudio = config.playAudio ? { emoji: "🔊", title: "Playing" } : { emoji: "🔇", title: "Muted" };

        // todo refactor to separate component / layer
        const cameraDevice = video?.stream ? "📹🟢" : "📹🔴";
        const screenSharingDevice = screenSharing?.stream ? "🖥🟢" : "🖥🔴";
        const microphoneDevice = audio?.stream ? "🔊🟢" : "🔊🔴";

        const cameraStreamStatus = video?.enabled ? "📹🟢" : "📹🔴";
        const screenSharingStreamStatus = screenSharing?.enabled ? "🖥🟢" : "🖥🔴";
        const microphoneStreamStatus = audio?.enabled ? "🔊🟢" : "🔊🔴";

        const cameraTrack = video?.remoteTrackId ? "📹🟢" : "📹🔴";
        const screenSharingTrack = screenSharing?.remoteTrackId ? "🖥🟢" : "🖥🔴";
        const microphoneTrack = audio?.remoteTrackId ? "🔊🟢" : "🔊🔴";

        const cameraMetadataStatus = video?.metadata?.active ? "📹🟢" : "📹🔴";
        const screenSharingMetadataStatus = screenSharing?.metadata?.active ? "🖥🟢" : "🖥🔴";
        const microphoneMetadataStatus = audio?.metadata?.active ? "🔊🟢" : "🔊🔴";

        return (
          <MediaPlayerTile
            key={config.mediaPlayerId}
            peerId={config.peerId}
            video={video}
            audioStream={audio?.stream}
            className={!oneColumn ? clsx(gridConfig.span, gridConfig.tileClass) : undefined}
            cameraOffImage={showDisabledIcon(video) ? <InitialsImage initials={config.initials} /> : null}
            layers={
              <>
                {showDeveloperInfo && (
                  <PeerInfoLayer
                    topRight={
                      <div>
                        <div className="text-right">
                          <span title="Streaming" className="ml-2">
                            Device:
                          </span>
                          <span title="Screen Sharing" className="ml-2">
                            {screenSharingDevice}
                          </span>
                          <span title="Camera" className="ml-2">
                            {cameraDevice}
                          </span>
                          <span title="Audio" className="ml-2">
                            {microphoneDevice}
                          </span>
                        </div>
                        <div className="text-right">
                          <span title="Streaming" className="ml-2">
                            Stream status:
                          </span>
                          <span title="Screen Sharing" className="ml-2">
                            {screenSharingStreamStatus}
                          </span>
                          <span title="Camera" className="ml-2">
                            {cameraStreamStatus}
                          </span>
                          <span title="Audio" className="ml-2">
                            {microphoneStreamStatus}
                          </span>
                        </div>
                        <div className="text-right">
                          <span title="Streaming" className="ml-2">
                            Active tracks:
                          </span>
                          <span title="Screen Sharing" className="ml-2">
                            {screenSharingTrack}
                          </span>
                          <span title="Camera" className="ml-2">
                            {cameraTrack}
                          </span>
                          <span title="Audio" className="ml-2">
                            {microphoneTrack}
                          </span>
                        </div>
                        <div className="text-right">
                          <span title="Streaming" className="ml-2">
                            Metadata:
                          </span>
                          <span title="Screen Sharing" className="ml-2">
                            {screenSharingMetadataStatus}
                          </span>
                          <span title="Camera" className="ml-2">
                            {cameraMetadataStatus}
                          </span>
                          <span title="Audio" className="ml-2">
                            {microphoneMetadataStatus}
                          </span>
                        </div>
                      </div>
                    }
                    bottomRight={
                      <div className="text-right">
                        <span className="ml-2">Allow audio playing:</span>
                        <span title={localAudio.title} className="ml-2">
                          {localAudio.emoji}
                        </span>
                      </div>
                    }
                  />
                )}
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

export default MediaPlayerPeersSection;
