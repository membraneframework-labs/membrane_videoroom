import React from "react";
import { useDeveloperInfo } from "../../../contexts/DeveloperInfoContext";
import MediaControlButton from "../../../pages/room/components/MediaControlButton";
import { activeButtonStyle, neutralButtonStyle } from "../../../pages/room/components/MediaControlButtons";
import {
  MediaPlayerTileConfig,
  TrackWithId,
} from "../../../pages/room/components/StreamPlayer/MediaPlayerPeersSection";
import MediaPlayerTile from "../../../pages/room/components/StreamPlayer/MediaPlayerTile";
import { AUDIO_TRACKS_CONFIG, LOCAL_PEER_NAME, LOCAL_VIDEO_ID, VIDEO_TRACKS_CONFIG } from "../../../pages/room/consts";
import { usePeersState } from "../../../pages/room/hooks/usePeerState";
import { useStreamManager } from "../../../pages/room/hooks/useStreamManager";
import { remoteTrackToLocalTrack } from "../../../pages/room/VideochatSection";
import InitialsImage, { computeInitials } from "../../room-page/components/InitialsImage";
import Camera from "../../room-page/icons/Camera";
import CameraOff from "../../room-page/icons/CameraOff";
import Microphone from "../../room-page/icons/Microphone";
import MicrophoneOff from "../../room-page/icons/MicrophoneOff";

type HomePageVideoTileProps = {
  displayName: string;
};

const HomePageVideoTile: React.FC<HomePageVideoTileProps> = ({ displayName }) => {
  const { simulcast, cameraAutostart, audioAutostart } = useDeveloperInfo();
  const { state: peerState, api: peerApi } = usePeersState();
  const isConnected = !!peerState?.local?.id;
  const localPeer = peerState.local;

  const videoTrack: TrackWithId | null = remoteTrackToLocalTrack(localPeer?.tracks["camera"]);
  const audioTrack: TrackWithId | null = remoteTrackToLocalTrack(localPeer?.tracks["audio"]);

  const localUser: MediaPlayerTileConfig = {
    peerId: localPeer?.id,
    displayName: LOCAL_PEER_NAME,
    initials: computeInitials(displayName),
    video: videoTrack ? [videoTrack] : [],
    audio: audioTrack ? [audioTrack] : [],
    flipHorizontally: true,
    streamSource: "local",
    playAudio: false,
    mediaPlayerId: LOCAL_VIDEO_ID,
  };
  const camera = useStreamManager(
    "camera",
    "automatic",
    isConnected,
    simulcast.status,
    undefined,
    VIDEO_TRACKS_CONFIG,
    peerApi,
    cameraAutostart.status
  );
  const audio = useStreamManager(
    "audio",
    "automatic",
    isConnected,
    simulcast.status,
    undefined,
    AUDIO_TRACKS_CONFIG,
    peerApi,
    audioAutostart.status
  );

  return (
    <MediaPlayerTile
      key="room-preview"
      peerId={localUser.peerId}
      video={localUser.video[0]}
      audioStream={localUser.audio[0]?.stream}
      playAudio={localUser.playAudio}
      streamSource={localUser.streamSource}
      flipHorizontally
      layers={
        <>
          {!cameraAutostart.status ? <InitialsImage initials={localUser.initials} /> : null}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform gap-x-4">
            {camera?.local.isEnabled ? (
              <MediaControlButton
                key={"cam-off"}
                icon={Camera}
                hover="Turn off the camera"
                className={neutralButtonStyle}
                onClick={() => {
                  camera.remote.setActive(false);
                  camera.local.disable();
                  cameraAutostart.setCameraAutostart(false);
                }}
              />
            ) : (
              <MediaControlButton
                key={"cam-on"}
                icon={CameraOff}
                hover="Turn on the camera"
                className={activeButtonStyle}
                onClick={() => {
                  if (camera?.local.stream) {
                    camera.local.enable();
                  } else {
                    camera?.local.start();
                  }
                  camera?.remote.setActive(true);
                  cameraAutostart.setCameraAutostart(true);
                }}
              />
            )}
            {audio?.local.isEnabled ? (
              <MediaControlButton
                key={"mic-mute"}
                icon={Microphone}
                hover="Turn off the microphone"
                className={neutralButtonStyle}
                onClick={() => {
                  audio.local.disable();
                  audio.remote.setActive(false);
                  audioAutostart.setAudioAutostart(false);
                }}
              />
            ) : (
              <MediaControlButton
                key={"mic-unmute"}
                icon={MicrophoneOff}
                hover="Turn on the microphone"
                className={activeButtonStyle}
                onClick={() => {
                  if (audio?.local.stream) {
                    audio.local.enable();
                  } else {
                    audio?.local.start();
                  }
                  audio?.remote.setActive(true);
                  audioAutostart.setAudioAutostart(true);
                }}
              />
            )}
          </div>
        </>
      }
    />
  );
};

export default HomePageVideoTile;
