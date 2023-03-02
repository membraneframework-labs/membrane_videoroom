import React from "react";
import MediaControlButton from "../../../pages/room/components/MediaControlButton";
import MediaPlayerTile from "../../../pages/room/components/StreamPlayer/MediaPlayerTile";
import { AUDIO_TRACKS_CONFIG, VIDEO_TRACKS_CONFIG } from "../../../pages/room/consts";
import { useMedia } from "../../../pages/room/hooks/useMedia";
import { usePeersState } from "../../../pages/room/hooks/usePeerState";
import { useSetLocalUserTrack } from "../../../pages/room/hooks/useSetLocalUserTrack";
import { TrackWithId } from "../../../pages/types";
import InitialsImage, { computeInitials } from "../../room-page/components/InitialsImage";
import { activeButtonStyle, neutralButtonStyle } from "../../room-page/consts";
import Camera from "../../room-page/icons/Camera";
import CameraOff from "../../room-page/icons/CameraOff";
import Microphone from "../../room-page/icons/Microphone";
import MicrophoneOff from "../../room-page/icons/MicrophoneOff";
import { remoteTrackToLocalTrack } from "../../room-page/utils/remoteTrackToLocalTrack";
import { usePreviewSettings } from "../hooks/usePreviewSettings";

type HomePageVideoTileProps = {
  displayName: string;
};

const HomePageVideoTile: React.FC<HomePageVideoTileProps> = ({ displayName }) => {
  const { cameraAutostart, audioAutostart } = usePreviewSettings();
  const { state: peerState, api: peerApi } = usePeersState();

  const localPeer = peerState.local;

  const videoTrack: TrackWithId | null = remoteTrackToLocalTrack(localPeer?.tracks["camera"]);
  const initials = computeInitials(displayName);

  const localCamera = useMedia(VIDEO_TRACKS_CONFIG, cameraAutostart.status);
  useSetLocalUserTrack("camera", peerApi, localCamera.stream, localCamera.isEnabled);
  const localAudio = useMedia(AUDIO_TRACKS_CONFIG, audioAutostart.status);
  useSetLocalUserTrack("audio", peerApi, localAudio.stream, localAudio.isEnabled);

  return (
    <MediaPlayerTile
      key="room-preview"
      peerId={localPeer?.id}
      video={videoTrack}
      audio={null}
      streamSource="local"
      flipHorizontally
      layers={
        <>
          {!cameraAutostart.status || !localCamera.isEnabled ? <InitialsImage initials={initials} /> : null}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform gap-x-4">
            {localCamera.isEnabled ? (
              <MediaControlButton
                key={"cam-off"}
                icon={Camera}
                hover="Turn off the camera"
                className={neutralButtonStyle}
                onClick={() => {
                  localCamera.disable();
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
                  if (localCamera?.stream) {
                    localCamera.enable();
                  } else {
                    localCamera.start();
                  }
                  cameraAutostart.setCameraAutostart(true);
                }}
              />
            )}
            {localAudio.isEnabled ? (
              <MediaControlButton
                key={"mic-mute"}
                icon={Microphone}
                hover="Turn off the microphone"
                className={neutralButtonStyle}
                onClick={() => {
                  localAudio.disable();
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
                  if (localAudio.stream) {
                    localAudio.enable();
                  } else {
                    localAudio.start();
                  }
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
