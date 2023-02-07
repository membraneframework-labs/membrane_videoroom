import React, { FC, useEffect, useState } from "react";
import { AUDIO_TRACKS_CONFIG, SCREEN_SHARING_TRACKS_CONFIG, VIDEO_TRACKS_CONFIG } from "./consts";
import MediaControlButtons from "./components/MediaControlButtons";
import { PeerMetadata } from "./hooks/usePeerState";
import { useToggle } from "./hooks/useToggle";
import { VideochatSection } from "./VideochatSection";
import { getRandomAnimalEmoji } from "./utils";
import { StreamingMode } from "./hooks/useMembraneMediaStreaming";
import PageLayout from "../../features/room-page/components/PageLayout";
import useToast from "../../features/shared/hooks/useToast";
import useEffectOnChange from "../../features/shared/hooks/useEffectOnChange";
import { ErrorMessage, messageComparator } from "./errorMessage";
import { useAcquireWakeLockAutomatically } from "./hooks/useAcquireWakeLockAutomatically";
import { useLog } from "../../helpers/UseLog";
import { useLibraryStreamManager } from "../../libraryUsage/useLibraryStreamManager";
import { useConnect, useSelector } from "../../libraryUsage/setup";
import { createFullStateSelector, createLocalPeerIdsSelector } from "../../library/selectors";

type Props = {
  displayName: string;
  roomId: string;
  isSimulcastOn: boolean;
  manualMode: boolean;
  autostartStreaming?: boolean;
};

export type SetErrorMessage = (value: string) => void;

const RoomPage: FC<Props> = ({ roomId, displayName, isSimulcastOn, manualMode, autostartStreaming }: Props) => {
  useAcquireWakeLockAutomatically();

  const mode: StreamingMode = manualMode ? "manual" : "automatic";

  // todo add error message
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | undefined>();
  const [showSimulcastMenu, toggleSimulcastMenu] = useToggle(false);
  const [peerMetadata] = useState<PeerMetadata>({ emoji: getRandomAnimalEmoji(), displayName });

  const connect = useConnect();
  useEffect(() => {
    console.log({ connect, isSimulcastOn, peerMetadata, roomId });
    return connect(roomId, peerMetadata, isSimulcastOn);
  }, [connect, isSimulcastOn, peerMetadata, roomId]);

  const localPeerId = useSelector(createLocalPeerIdsSelector());
  useLog(localPeerId, "localPeerId");
  const isConnected = !!localPeerId;

  // const state = useSelector(createFullStateSelector());
  // useLog(state, "Full state");

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

  const { addToast } = useToast();

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

  return (
    <PageLayout>
      <div className="flex h-full w-full flex-col gap-y-4">
        {/*<button*/}
        {/*  onClick={() => {*/}
        {/*    if (!membrane?.connectivity?.connect) return;*/}
        {/*    membrane?.connectivity?.connect(roomId, peerMetadata, isSimulcastOn);*/}
        {/*  }}*/}
        {/*>*/}
        {/*  Connect!*/}
        {/*</button>*/}
        {/* main grid - videos + future chat */}
        <section className="flex h-full w-full flex-col">
          <VideochatSection showSimulcast={showSimulcastMenu} />
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
        <div className="invisible absolute bottom-3 right-3 flex flex-col items-stretch md:visible">
          {isSimulcastOn && (
            <button
              onClick={toggleSimulcastMenu}
              className="focus:outline-none focus:shadow-outline m-1 w-full rounded bg-brand-grey-80 py-2 px-4 text-white hover:bg-brand-grey-100"
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
