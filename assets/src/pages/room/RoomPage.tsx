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
    <section>
      <div className="relative flex h-screen flex-col">
        {errorMessage && <div className="w-full bg-red-700 p-1 text-white">{errorMessage}</div>}

        {showDeveloperInfo && (
          <div className="text-shadow-lg absolute right-0 top-0 flex flex-col p-2 text-right text-white">
            <span className="ml-2">Is WakeLock supported: {wakeLock.isSupported ? "🟢" : "🔴"}</span>
          </div>
        )}

        <section className="mb-14 flex h-screen flex-col">
          <header className="p-4">
            <div className="flex items-center">
              <img src="/svg/logo_min.svg" className="mr-2 hidden h-8 md:block" alt="Mini logo" />
              <h2 className="text-center text-2xl font-bold text-white md:text-4xl">Membrane WebRTC video room demo</h2>
            </div>
            <h3 className="mb-2 text-2xl font-semibold text-white">Room {roomId}</h3>
            <h3 className="text-xl font-medium text-white">
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
        </section>
      </div>
      <MediaControlButtons
        mode={mode}
        userMediaVideo={camera.local}
        cameraStreaming={camera.remote}
        userMediaAudio={audio.local}
        audioStreaming={audio.remote}
        displayMedia={screenSharing.local}
        screenSharingStreaming={screenSharing.remote}
      />
      <div className="absolute bottom-2 right-2 flex flex-col items-stretch">
        {isSimulcastOn && (
          <button
            onClick={toggleSimulcastMenu}
            className="focus:outline-none focus:shadow-outline m-1 w-full rounded bg-gray-700 py-2 px-4 font-bold text-white ring-gray-800 hover:bg-gray-900 focus:border-gray-800 focus:ring"
            type="submit"
          >
            Show simulcast controls
          </button>
        )}
        <button
          onClick={toggleDeveloperInfo}
          className="focus:outline-none focus:shadow-outline m-1 w-full rounded bg-gray-700 py-2 px-4 font-bold text-white ring-gray-800 hover:bg-gray-900 focus:border-gray-800 focus:ring"
          type="submit"
        >
          Show developer info
        </button>
      </div>
    </section>
  );
};

export default RoomPage;
