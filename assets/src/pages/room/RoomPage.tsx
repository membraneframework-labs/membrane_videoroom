import React, { FC, useCallback, useEffect, useRef, useState } from "react";
// import { useMembraneClient } from "./hooks/useMembraneClient";
import MediaControlButtons from "./components/MediaControlButtons";
import { PeerMetadata, usePeersState } from "./hooks/usePeerState";
import { useToggle } from "./hooks/useToggle";
import { VideochatSection } from "./VideochatSection";
import { getRandomAnimalEmoji } from "./utils";
import { useStreamManager } from "./hooks/useStreamManager";
import { StreamingMode, useMembraneMediaStreaming } from "./hooks/useMembraneMediaStreaming";
import PageLayout from "../../features/room-page/components/PageLayout";
import useToast from "../../features/shared/hooks/useToast";
import useEffectOnChange from "../../features/shared/hooks/useEffectOnChange";
import { ErrorMessage, messageComparator } from "./errorMessage";
import { useAcquireWakeLockAutomatically } from "./hooks/useAcquireWakeLockAutomatically";
import clsx from "clsx";
import { useLocalPeer } from "../../features/devices/LocalPeerMediaContext";
import RoomSidebar from "./RoomSidebar";
import { useConnect, useSelector } from "../../jellifish.types";
import Button from "../../features/shared/components/Button";
import { useServerSdk } from "../../ServerSdkContext";
import { createFullStateSelector } from "@jellyfish-dev/react-client-sdk";
import { useDeveloperInfo } from "../../contexts/DeveloperInfoContext";

type Props = {
  displayName: string;
  roomId: string;
  isSimulcastOn: boolean;
  manualMode: boolean;
};

const RoomPage: FC<Props> = ({ roomId, displayName, manualMode }: Props) => {
  useAcquireWakeLockAutomatically();

  const mode: StreamingMode = manualMode ? "manual" : "automatic";
  const { simulcast } = useDeveloperInfo();
  const isSimulcastOn = simulcast.status;

  const [errorMessage, setErrorMessage] = useState<ErrorMessage | undefined>();
  const [showSimulcastMenu, toggleSimulcastMenu] = useToggle(false);

  const connect = useConnect();
  const state = useSelector(createFullStateSelector());
  useEffect(() => {
    console.log({ state });
  }, [state]);

  const { video, audio, screenShare } = useLocalPeer();

  const isConnected = state.status === "joined";

  const cameraStreaming = useMembraneMediaStreaming(mode, "camera", isConnected, video.device);
  const audioStreaming = useMembraneMediaStreaming(mode, "audio", isConnected, audio.device);
  const screenSharingStreaming = useMembraneMediaStreaming(mode, "screensharing", isConnected, screenShare.device);

  const { addToast } = useToast();

  const { roomApi, peerApi, peerWebsocket } = useServerSdk();

  useEffectOnChange(screenShare.device.stream, () => {
    if (screenShare.device.stream) {
      addToast({ id: "screen-sharing", message: "You are sharing the screen now", timeout: 4000 });
    }
  });

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

  const connectFn = useCallback(() => {
    roomApi.jellyfishWebRoomControllerIndex().then((response) => {
      const rooms = response.data.data;

      if (rooms[0]) {
        peerApi.jellyfishWebPeerControllerCreate(rooms[0].id, { type: "webrtc" }).then((response) => {
          const peerRespo = response.data.data;
          const token = peerRespo.token;
          console.log({ peerRespo });

          connect({
            peerMetadata: { name: displayName },
            token,
            websocketUrl: peerWebsocket,
          });
        });
      } else {
        console.log({ name: "Creating new room" });
        roomApi.jellyfishWebRoomControllerCreate({ maxPeers: 10 }).then((response) => {
          const roomId = response.data.data.id;
          console.log({ roomId });
          peerApi.jellyfishWebPeerControllerCreate(roomId, { type: "webrtc" }).then((response) => {
            const peerRespo = response.data.data;
            const token = peerRespo.token;
            console.log({ peerRespo });

            connect({
              peerMetadata: { name: displayName },
              token,
              websocketUrl: peerWebsocket,
            });
          });
        });
      }
    });

    console.log("Connected!");
  }, [connect, displayName, peerApi, peerWebsocket, roomApi]);

  // todo refactor me!
  const firstTime = useRef<boolean>(true);
  useEffect(() => {
    if (firstTime.current) {
      connectFn();
      firstTime.current = false;
    }
  }, [connectFn]);

  return (
    <PageLayout>
      {/*<Button onClick={connectFn}>Connect</Button>*/}
      <div className="flex h-full w-full flex-col gap-y-4">
        {/* main grid - videos + future chat */}
        <section
          className={clsx(
            "flex h-full w-full self-center justify-self-center 3xl:max-w-[3200px]",
            isSidebarOpen && "gap-x-4"
          )}
        >
          <VideochatSection showSimulcast={showSimulcastMenu} unpinnedTilesHorizontal={isSidebarOpen} />

          <RoomSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        </section>

        <MediaControlButtons
          mode={mode}
          cameraStreaming={cameraStreaming}
          audioStreaming={audioStreaming}
          screenSharingStreaming={screenSharingStreaming}
          isSidebarOpen={isSidebarOpen}
          openSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* dev helpers */}
        <div className="invisible absolute bottom-3 right-3 flex flex-col items-stretch md:visible">
          {isSimulcastOn && (
            <button
              onClick={toggleSimulcastMenu}
              className="m-1 w-full rounded bg-brand-grey-80 px-4 py-2 text-white hover:bg-brand-grey-100"
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
