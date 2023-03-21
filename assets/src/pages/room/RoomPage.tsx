import React, { FC, useEffect, useState } from "react";
import { useMembraneClient } from "./hooks/useMembraneClient";
import MediaControlButtons from "./components/MediaControlButtons";
import { PeerMetadata, usePeersState } from "./hooks/usePeerState";
import { useToggle } from "./hooks/useToggle";
import { VideochatSection } from "./VideochatSection";
import { getRandomAnimalEmoji } from "./utils";
import { useStreamManager } from "./hooks/useStreamManager";
import { StreamingMode } from "./hooks/useMembraneMediaStreaming";
import PageLayout from "../../features/room-page/components/PageLayout";
import useToast from "../../features/shared/hooks/useToast";
import useEffectOnChange from "../../features/shared/hooks/useEffectOnChange";
import { ErrorMessage, messageComparator } from "./errorMessage";
import { useAcquireWakeLockAutomatically } from "./hooks/useAcquireWakeLockAutomatically";
import Sidebar from "../../features/room-page/components/Sidebar";
import clsx from "clsx";
import { useLocalPeer } from "../../contexts/LocalPeerContext";

type Props = {
  displayName: string;
  roomId: string;
  isSimulcastOn: boolean;
  manualMode: boolean;
  cameraAutostartStreaming?: boolean;
  audioAutostartStreaming?: boolean;
};

const RoomPage: FC<Props> = ({
  roomId,
  displayName,
  isSimulcastOn,
  manualMode,
  cameraAutostartStreaming,
  audioAutostartStreaming,
}: Props) => {
  useAcquireWakeLockAutomatically();

  const mode: StreamingMode = manualMode ? "manual" : "automatic";

  const [errorMessage, setErrorMessage] = useState<ErrorMessage | undefined>();
  const [showSimulcastMenu, toggleSimulcastMenu] = useToggle(false);
  const [peerMetadata] = useState<PeerMetadata>({ emoji: getRandomAnimalEmoji(), displayName });

  const { state: peerState, api: peerApi } = usePeersState();
  const { webrtc } = useMembraneClient(roomId, peerMetadata, isSimulcastOn, peerApi, setErrorMessage);

  const isConnected = !!peerState?.local?.id;

  useEffect(() => {
    console.log({ peerState });
  }, [peerState]);

  const { screenSharingDevice, videoDevice, audioDevice } = useLocalPeer();

  const camera = useStreamManager("camera", mode, isConnected, isSimulcastOn, webrtc || null, peerApi, videoDevice);
  const audio = useStreamManager("audio", mode, isConnected, isSimulcastOn, webrtc || null, peerApi, audioDevice);
  const screenSharing = useStreamManager(
    "screensharing",
    mode,
    isConnected,
    isSimulcastOn,
    webrtc || null,
    peerApi,
    screenSharingDevice
  );

  const { addToast } = useToast();

  // useEffectOnChange(screenSharing.local.isEnabled, () => {
  //   if (screenSharing.local.isEnabled) {
  //     addToast({ id: "screen-sharing", message: "You are sharing the screen now", timeout: 4000 });
  //   }
  // });

  useEffectOnChange(
    errorMessage,
    () => {
      if (errorMessage) {
        addToast({
          id: errorMessage.id || crypto.randomUUID(),
          message: errorMessage.message,
          timeout: "INFINITY",
          type: "error",
        });
      }
    },
    messageComparator
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <PageLayout>
      <div className="flex h-full w-full flex-col gap-y-4">
        {/* main grid - videos + future chat */}
        <section
          className={clsx(
            "flex h-full w-full self-center justify-self-center 3xl:max-w-[3200px]",
            isSidebarOpen && "gap-x-4"
          )}
        >
          <VideochatSection
            peers={peerState.remote}
            localPeer={peerState.local}
            showSimulcast={showSimulcastMenu}
            webrtc={webrtc}
            unpinnedTilesHorizontal={isSidebarOpen}
          />

          <div
            className={clsx(
              isSidebarOpen ? "max-w-[300px]" : "max-w-0",
              "overflow-hidden transition-all duration-300",
              "hidden w-full md:flex"
            )}
          >
            <Sidebar peers={peerState.remote} localPeer={peerState.local} />
          </div>
        </section>

        <MediaControlButtons
          mode={mode}
          userMediaVideo={camera.local}
          cameraStreaming={camera.remote}
          userMediaAudio={audio.local}
          audioStreaming={audio.remote}
          displayMedia={screenSharing.local}
          screenSharingStreaming={screenSharing.remote}
          isSidebarOpen={isSidebarOpen}
          openSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* dev helpers */}
        <div className="invisible absolute bottom-3 right-3 flex flex-col items-stretch md:visible">
          {isSimulcastOn && (
            <button
              onClick={toggleSimulcastMenu}
              className="m-1 w-full rounded bg-brand-grey-80 py-2 px-4 text-white hover:bg-brand-grey-100"
              type="submit"
            >
              Show simulcast controls
            </button>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default RoomPage;
