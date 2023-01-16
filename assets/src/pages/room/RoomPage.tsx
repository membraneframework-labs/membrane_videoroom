import React, { FC, useState } from "react";
import { AUDIO_TRACKS_CONFIG, SCREEN_SHARING_TRACKS_CONFIG, VIDEO_TRACKS_CONFIG } from "./consts";
import { useMembraneClient } from "./hooks/useMembraneClient";
import MediaControlButtons from "./components/MediaControlButtons";
import { PeerMetadata, RemotePeer, usePeersState } from "./hooks/usePeerState";
import { useToggle } from "./hooks/useToggle";
import { VideochatSection } from "./VideochatSection";
import { getRandomAnimalEmoji } from "./utils";
import { useStreamManager } from "./hooks/useStreamManager";
import { StreamingMode } from "./hooks/useMembraneMediaStreaming";
import { useAcquireWakeLockAutomatically } from "./hooks/useAcquireWakeLockAutomatically";
import PageLayout from "../../features/room-page/components/PageLayout";
import Button from "../../features/shared/components/Button";

type Props = {
  displayName: string;
  roomId: string;
  isSimulcastOn: boolean;
  manualMode: boolean;
  autostartStreaming?: boolean;
};

export type SetErrorMessage = (value: string) => void;

const RoomPage: FC<Props> = ({ roomId, displayName, isSimulcastOn, manualMode, autostartStreaming }: Props) => {
  const wakeLock = useAcquireWakeLockAutomatically();

  const mode: StreamingMode = manualMode ? "manual" : "automatic";

  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [showSimulcastMenu, toggleSimulcastMenu] = useToggle(false);
  const [showDeveloperInfo, toggleDeveloperInfo] = useToggle(false);
  const [peerMetadata] = useState<PeerMetadata>({ emoji: getRandomAnimalEmoji(), displayName });

  const { state: peerState, api: peerApi } = usePeersState();
  const { webrtc } = useMembraneClient(roomId, peerMetadata, isSimulcastOn, peerApi, setErrorMessage);

  const isConnected = !!peerState?.local?.id;

  const camera = useStreamManager(
    "camera",
    mode,
    isConnected,
    isSimulcastOn,
    webrtc,
    VIDEO_TRACKS_CONFIG,
    peerApi,
    autostartStreaming
  );
  const audio = useStreamManager(
    "audio",
    mode,
    isConnected,
    isSimulcastOn,
    webrtc,
    AUDIO_TRACKS_CONFIG,
    peerApi,
    autostartStreaming
  );
  const screenSharing = useStreamManager(
    "screensharing",
    mode,
    isConnected,
    isSimulcastOn,
    webrtc,
    SCREEN_SHARING_TRACKS_CONFIG,
    peerApi,
    false
  );

  return (
    <PageLayout>
      <div className="flex flex-col gap-y-4 w-full h-full">
        {/* main grid - videos + future chat */}
        <section className="w-full h-full flex flex-col">
          {errorMessage && <div className="bg-red-700 text-white p-1 w-full">{errorMessage}</div>}

          {showDeveloperInfo && (
            <div className="absolute text-shadow-lg right-0 top-0 p-2 flex flex-col text-right">
              <span className="ml-2">Is WakeLock supported: {wakeLock.isSupported ? "🟢" : "🔴"}</span>
            </div>
          )}

          <div className="flex flex-col">
            <header>
              <h3 className="text-2xl font-semibold mb-2">Room {roomId}</h3>
              <h3 className="text-xl font-medium">
                Participants{" "}
                <span>
                  {peerMetadata.emoji} {peerMetadata.displayName}
                </span>
                {peerState.remote.map((peer: RemotePeer) => (
                  <span key={peer.id} title={peer.id}>
                    {peer.emoji} {peer.displayName}
                  </span>
                ))}
              </h3>
            </header>
            <VideochatSection
              peers={peerState.remote}
              localPeer={peerState.local}
              showSimulcast={showSimulcastMenu}
              showDeveloperInfo={showDeveloperInfo}
              webrtc={webrtc}
            />
          </div>
        </section>

        {/* menu tooltip */}
        <MediaControlButtons
          mode={mode}
          userMediaVideo={camera.local}
          cameraStreaming={camera.remote}
          userMediaAudio={audio.local}
          audioStreaming={audio.remote}
          displayMedia={screenSharing.local}
          screenSharingStreaming={screenSharing.remote}
        />

        {/* dev helpers */}
        <div className="absolute bottom-4 right-3 flex flex-col items-stretch">
          {isSimulcastOn && (
            <button
              onClick={toggleSimulcastMenu}
              className="bg-gray-700 hover:bg-gray-900 text-white py-2 px-4 m-1 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
            >
              Show simulcast controls
            </button>
          )}
          <Button
            onClick={toggleDeveloperInfo}
            className="bg-gray-700 hover:bg-gray-900 text-white py-2 px-4 m-1 rounded focus:outline-none focus:shadow-outline w-full"
          >
            {showDeveloperInfo ? "Hide developer info" : "Show developer info"}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default RoomPage;
