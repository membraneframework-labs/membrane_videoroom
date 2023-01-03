import React, { FC } from "react";
import { ApiTrack, RemotePeer } from "../../hooks/usePeerState";
import MediaPlayerTile from "./MediaPlayerTile";
import { MembraneWebRTC, TrackEncoding } from "@membraneframework/membrane-webrtc-js";
import clsx from "clsx";
import { StreamSource, TrackType } from "../../../types";
import InfoLayer from "./PeerInfoLayer";
import PeerInfoLayer from "./PeerInfoLayer";

export type TrackWithId = {
  stream?: MediaStream;
  remoteTrackId?: string;
  encodingQuality?: TrackEncoding;
  metadata?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  enabled?: boolean;
};

export type MediaPlayerTileConfig = {
  peerId?: string;
  emoji?: string;
  flipHorizontally?: boolean;
  displayName?: string;
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
      emoji: peer.emoji,
      displayName: peer.displayName,
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

type Props = {
  peers: RemotePeer[];
  localUser: MediaPlayerTileConfig;
  showSimulcast?: boolean;
  showDeveloperInfo?: boolean;
  selectRemoteTrackEncoding?: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  oneColumn?: boolean;
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

  return (
    <div
      id="videos-grid"
      className={clsx({
        "grid flex-1 grid-flow-row gap-4 justify-items-center h-full grid-cols-1": true,
        "md:grid-cols-2": !oneColumn,
      })}
    >
      {allPeersConfig.map((config, idx) => {
        // todo for now only first audio, video and screen sharing stream are handled
        const video: TrackWithId | undefined = config.video[0];
        const screenSharing: TrackWithId | undefined = config.screenSharing[0];
        const audio: TrackWithId | undefined = config.audio[0];

        const emoji = config.emoji || "";
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
            layers={
              <>
                {showDeveloperInfo && (
                  <PeerInfoLayer
                    topLeft={<div>{emoji}</div>}
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
                <InfoLayer
                  bottomLeft={<div>{config.displayName}</div>}
                  topLeft={
                    <div className="flex flex-row">
                      {showDisabledIcon(audio) && (
                        <img
                          className={clsx(`invert group-disabled:invert-80 m-1`, {
                            "animate-spin": isLoading(audio),
                          })}
                          height="26"
                          width="26"
                          src="/svg/mic-off-fill.svg"
                          alt="Microphone muted icon"
                        />
                      )}
                      {showDisabledIcon(video) && (
                        <img
                          className={clsx(`invert group-disabled:invert-80 m-1`, {
                            "animate-spin": isLoading(video),
                          })}
                          height="26"
                          width="26"
                          src="/svg/camera-off-line.svg"
                          alt="Camera disabled icon"
                        />
                      )}
                    </div>
                  }
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
