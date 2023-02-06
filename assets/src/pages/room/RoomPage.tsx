import React, { FC, useCallback, useEffect, useState } from "react";
import { AUDIO_TRACKS_CONFIG, SCREEN_SHARING_TRACKS_CONFIG, VIDEO_TRACKS_CONFIG } from "./consts";
import MediaControlButtons from "./components/MediaControlButtons";
import { PeerMetadata, usePeersState } from "./hooks/usePeerState";
import { useToggle } from "./hooks/useToggle";
import { VideochatSection } from "./VideochatSection";
import { getRandomAnimalEmoji } from "./utils";
import { useStreamManager } from "./hooks/useStreamManager";
import { StreamingMode } from "./hooks/useMembraneMediaStreaming";
import { useAcquireWakeLockAutomatically } from "./hooks/useAcquireWakeLockAutomatically";
import PageLayout from "../../features/room-page/components/PageLayout";
import Button from "../../features/shared/components/Button";
import { useLibraryMembraneClient } from "../../library/withEventEmitter/useLibraryMembraneClient";
import { useLog } from "../../helpers/UseLog";
import { useSelector } from "../../library/noContext/useSelector";
import { createFullStateSelector, createIsConnectedSelector } from "../../library/selectors";
import { useLibraryStreamManager } from "../../libraryUsage/useLibraryStreamManager";
import { UseMembraneClientType } from "../../library/state.types";
import { TrackMetadata } from "../../libraryUsage/types";
import { createMembraneClient } from "../../library/noContext/noContextProvider";
import { useMembraneClient } from "../../libraryUsage/setup";

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

  // const clientWrapper: UseMembraneClientType<PeerMetadata, TrackMetadata> | null = useLibraryMembraneClient(
  //   roomId,
  //   peerMetadata,
  //   isSimulcastOn,
  //   setErrorMessage
  // );

  const membrane = useMembraneClient();
  useLog(membrane, "membrane state");
  // useEffect(() => {
  //   if (!membrane?.connectivity?.connect) return;
  //   if (membrane.status === null) {
  //     console.log("Connecting!");
  //     return membrane.connectivity.connect(roomId, peerMetadata, isSimulcastOn);
  //   }
  // }, [isSimulcastOn, membrane, peerMetadata, roomId]);

  // const client = useClient();
  //
  // useEffect(() => {
  //   client.connect(roomId, peerMetadata, isSimulcastOn);
  //
  //   return () => {
  //     client.disconnect();
  //   };
  // }, [isSimulcastOn, peerMetadata, roomId]);

  // const fullState = useSelector2(createFullStateSelector());
  // const isConnected = useSelector2(createIsConnectedSelector());

  // useLog(clientWrapper?.store, "State");
  // useLog(fullState, "Full state from selector");

  // const { state: peerState, api: peerApi } = usePeersState();
  // const { webrtc } = useMembraneClient(roomId, peerMetadata, isSimulcastOn, peerApi, setErrorMessage);

  const isConnected = !!membrane?.local.id;

  const camera = useLibraryStreamManager(
    "camera",
    mode,
    isConnected,
    isSimulcastOn,
    VIDEO_TRACKS_CONFIG,
    autostartStreaming
  );
  const audio = useLibraryStreamManager(
    "audio",
    mode,
    isConnected,
    isSimulcastOn,
    AUDIO_TRACKS_CONFIG,
    autostartStreaming
  );
  const screenSharing = useLibraryStreamManager(
    "screensharing",
    mode,
    isConnected,
    isSimulcastOn,
    SCREEN_SHARING_TRACKS_CONFIG,
    false
  );

  return (
    <PageLayout>
      <div className="flex h-full w-full flex-col gap-y-4">
        <button
          onClick={() => {
            if (!membrane?.connectivity?.connect) return;
            membrane?.connectivity?.connect(roomId, peerMetadata, isSimulcastOn);
          }}
        >
          Connect!
        </button>
        {/* main grid - videos + future chat */}
        <section className="flex h-full w-full flex-col">
          {errorMessage && <div className="w-full bg-red-700 p-1 text-white">{errorMessage}</div>}

          {showDeveloperInfo && (
            <div className="text-shadow-lg absolute right-0 top-16 flex flex-col p-2 text-right">
              <span className="ml-2">Is WakeLock supported: {wakeLock.isSupported ? "🟢" : "🔴"}</span>
            </div>
          )}

          {/*{clientWrapper && (*/}
          {/*<VideochatSection*/}
          {/*// clientWrapper={clientWrapper}*/}
          {/*// peers={peerState.remote}*/}
          {/*// localPeer={peerState.local}*/}
          {/*// showSimulcast={showSimulcastMenu}*/}
          {/*// showDeveloperInfo={showDeveloperInfo}*/}
          {/*// webrtc={webrtc}*/}
          {/*/>*/}
          {/*)}*/}
        </section>

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
              className="focus:outline-none focus:shadow-outline m-1 w-full rounded bg-gray-700 py-2 px-4 text-white hover:bg-gray-900"
              type="submit"
            >
              Show simulcast controls
            </button>
          )}
          <Button
            onClick={toggleDeveloperInfo}
            className="focus:outline-none focus:shadow-outline m-1 w-full rounded bg-gray-700 py-2 px-4 text-white hover:bg-gray-900"
          >
            {showDeveloperInfo ? "Hide developer info" : "Show developer info"}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default RoomPage;
