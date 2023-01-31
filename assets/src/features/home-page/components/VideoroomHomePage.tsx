import clsx from "clsx";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useDeveloperInfo } from "../../../contexts/DeveloperInfoContext";
import { useUser } from "../../../contexts/UserContext";
import MediaControlButton from "../../../pages/room/components/MediaControlButton";
import { MediaPlayerTileConfig } from "../../../pages/room/components/StreamPlayer/MediaPlayerPeersSection";
import MediaPlayerTile from "../../../pages/room/components/StreamPlayer/MediaPlayerTile";
import { AUDIO_TRACKS_CONFIG, LOCAL_PEER_NAME, LOCAL_VIDEO_ID, VIDEO_TRACKS_CONFIG } from "../../../pages/room/consts";
import { useMediaDeviceManager } from "../../../pages/room/hooks/useMediaDeviceManager";
import { usePeersState } from "../../../pages/room/hooks/usePeerState";
import { useStreamManager } from "../../../pages/room/hooks/useStreamManager";
import Camera from "../../room-page/icons/Camera";
import Microphone from "../../room-page/icons/Microphone";
import Button from "../../shared/components/Button";
import Input from "../../shared/components/Input";
import HomePageLayout from "./HomePageLayout";

import { activeButtonStyle, neutralButtonStyle } from "../../../pages/room/components/MediaControlButtons";
import CameraOff from "../../room-page/icons/CameraOff";
import MicrophoneOff from "../../room-page/icons/MicrophoneOff";

const VideoroomHomePage: React.FC = () => {
  const lastDisplayName: string | null = localStorage.getItem("displayName");
  const [displayNameInput, setDisplayNameInput] = useState(lastDisplayName || "");
  const match = useParams();
  const { setUsername } = useUser();

  const roomId: string = match?.roomId || "";
  const [roomIdInput, setRoomIdInput] = useState<string>(roomId);
  const buttonDisabled = !displayNameInput || !roomIdInput;

  const deviceManager = useMediaDeviceManager({ askOnMount: true });
  const { cameraAutostart, audioAutostart } = useDeveloperInfo();

  const { state: peerState, api: peerApi } = usePeersState();

  const isConnected = !!peerState?.local?.id;

  const camera = useStreamManager(
    "camera",
    "automatic",
    isConnected,
    true,
    undefined,
    VIDEO_TRACKS_CONFIG,
    peerApi,
    cameraAutostart.status
  );
  const audio = useStreamManager(
    "audio",
    "automatic",
    isConnected,
    true,
    undefined,
    AUDIO_TRACKS_CONFIG,
    peerApi,
    audioAutostart.status
  );

  const localPeer = peerState.local;

  const localUser: MediaPlayerTileConfig = {
    peerId: localPeer?.id,
    displayName: LOCAL_PEER_NAME,
    emoji: localPeer?.metadata?.emoji,
    video: localPeer?.tracks["camera"] ? [localPeer?.tracks["camera"]] : [],
    audio: localPeer?.tracks["audio"] ? [localPeer?.tracks["audio"]] : [],
    screenSharing: localPeer?.tracks["screensharing"] ? [localPeer?.tracks["screensharing"]] : [],
    showSimulcast: false,
    flipHorizontally: true,
    streamSource: "local",
    playAudio: false,
    mediaPlayerId: LOCAL_VIDEO_ID,
  };
  return (
    <HomePageLayout>
      <section className="flex flex-col items-center gap-y-12 sm:gap-y-18">
        {deviceManager.errorMessage && (
          <div className="w-full bg-red-700 p-1 text-white">{deviceManager.errorMessage}</div>
        )}
        <div className="flex flex-col items-center gap-y-6 text-center">
          <h2 className="text-3xl sm:text-5xl">Videoconferencing for everyone</h2>
          <p className="font-aktivGrotesk text-xl">Join the existing room or create a new one to start the meeting</p>
        </div>
        <div className="flex h-full w-full justify-between gap-x-24">
          <div className=" h-[400px] w-[600px]">
            <MediaPlayerTile
              key="room-preview"
              peerId={localUser.peerId}
              video={localUser.video[0]}
              audioStream={localUser.audio[0]?.stream}
              playAudio={localUser.playAudio}
              streamSource={localUser.streamSource}
              flipHorizontally
              layers={
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
              }
            />
          </div>
          <div className={clsx("mt-8 flex flex-col items-center", roomId ? "gap-y-12" : "gap-y-6")}>
            {roomId ? (
              <div className="flex w-full flex-col items-center justify-center text-center">
                <span>You are joining:</span>
                <span className="text-2xl font-medium">{roomId}</span>
              </div>
            ) : (
              <Input
                value={roomIdInput}
                onChange={(event) => setRoomIdInput(event.target.value)}
                type="text"
                required
                name="room_name"
                placeholder="Room name"
                label="Room name"
                disabled={!!roomId}
                className="w-80 sm:w-96"
              />
            )}
            <Input
              value={displayNameInput}
              onChange={(event) => setDisplayNameInput(event.target.value)}
              name="display_name"
              type="text"
              placeholder="Display name"
              label="Your name"
              className="w-80 sm:w-96"
            />
            <div className="flex w-full items-center justify-center">
              <Button
                onClick={() => {
                  localStorage.setItem("displayName", displayNameInput);
                  setUsername(displayNameInput);
                  // simulcast.setSimulcast(simulcastInput);
                  // manualMode.setManualMode(manualModeInput);
                  // cameraAutostart.setCameraAutostart(autostartCameraAndMicInput);
                }}
                href={`/room/${roomIdInput}`}
                name="join"
                variant="normal"
                disabled={buttonDisabled}
              >
                Join the room
              </Button>
            </div>
          </div>
        </div>
      </section>
    </HomePageLayout>
  );
};

export default VideoroomHomePage;
