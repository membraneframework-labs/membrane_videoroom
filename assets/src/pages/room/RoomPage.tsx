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
import clsx from "clsx";
import { useLocalPeer } from "../../features/devices/LocalPeerMediaContext";
import RoomSidebar from "./RoomSidebar";
import { useConnect, useSelector } from "../../jellifish.types";
import Button from "../../features/shared/components/Button";
import { useServerSdk } from "../../ServerSdkContext";
import { createFullStateSelector } from "@jellyfish-dev/react-client-sdk";

type Props = {
  displayName: string;
  roomId: string;
  isSimulcastOn: boolean;
  manualMode: boolean;
};

const RoomPage: FC<Props> = ({ roomId, displayName, isSimulcastOn, manualMode }: Props) => {
  useAcquireWakeLockAutomatically();

  const mode: StreamingMode = manualMode ? "manual" : "automatic";

  const [errorMessage, setErrorMessage] = useState<ErrorMessage | undefined>();
  const [showSimulcastMenu, toggleSimulcastMenu] = useToggle(false);
  const [peerMetadata] = useState<PeerMetadata>({ emoji: getRandomAnimalEmoji(), displayName });

  const [token, setToken] = useState<string | null>(null);

  // const { state: peerState, api: peerApi } = usePeersState();
  // const { webrtc } = useMembraneClient(roomId, peerMetadata, isSimulcastOn, peerApi, setErrorMessage);

  // const isConnected = !!peerState?.local?.id;
  const connect = useConnect();
  const state = useSelector(createFullStateSelector());
  useEffect(() => {
    console.log({ state });
  }, [state]);

  const { video: localVideo, audio: localAudio, screenShare } = useLocalPeer();

  const camera = useStreamManager("camera", mode, state.status === "joined", isSimulcastOn, localVideo.device);
  // const audio = useStreamManager("audio", mode, isConnected, isSimulcastOn, webrtc || null, peerApi, localAudio.device);
  // const screenSharing = useStreamManager(
  //   "screensharing",
  //   mode,
  //   isConnected,
  //   isSimulcastOn,
  //   webrtc || null,
  //   peerApi,
  //   screenShare.device
  // );

  const { addToast } = useToast();

  const { roomApi, peerApi, peerWebsocket } = useServerSdk();

  // useEffectOnChange(screenSharing.local.stream, () => {
  //   if (screenSharing.local.stream) {
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
          <Button
            onClick={() => {
              roomApi.jellyfishWebRoomControllerIndex().then((response) => {
                const rooms = response.data.data

                if(rooms[0]) {
                  peerApi.jellyfishWebPeerControllerCreate(rooms[0].id, { type: "webrtc" }).then((response) => {
                    const peerRespo = response.data.data;
                    const token = peerRespo.token;
                    console.log({ peerRespo });

                    setToken(token);

                    connect({
                      peerMetadata: { name: displayName },
                      token,
                      websocketUrl: peerWebsocket,
                    });
                  })
                } else {
                  console.log({name: "Creating new room"})
                  roomApi.jellyfishWebRoomControllerCreate({ maxPeers: 10 }).then((response) => {
                    const roomId = response.data.data.id;
                    console.log({ roomId });
                    peerApi.jellyfishWebPeerControllerCreate(roomId, { type: "webrtc" }).then((response) => {
                      const peerRespo = response.data.data;
                      const token = peerRespo.token;
                      console.log({ peerRespo });

                      setToken(token);

                      connect({
                        peerMetadata: { name: "Username" },
                        token,
                        websocketUrl: peerWebsocket,
                      });
                    });
                  })
                }
              });

              console.log("Connected!");
            }}
          >
            Connect
          </Button>
          {/*<VideochatSection*/}
          {/*  peers={peerState.remote}*/}
          {/*  localPeer={peerState.local}*/}
          {/*  showSimulcast={showSimulcastMenu}*/}
          {/*  webrtc={webrtc}*/}
          {/*  unpinnedTilesHorizontal={isSidebarOpen}*/}
          {/*/>*/}

          {/*<RoomSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} peerState={peerState} />*/}
        </section>

        {/*<MediaControlButtons*/}
        {/*  mode={mode}*/}
        {/*  userMediaVideo={camera.local}*/}
        {/*  cameraStreaming={camera.remote}*/}
        {/*  userMediaAudio={audio.local}*/}
        {/*  audioStreaming={audio.remote}*/}
        {/*  displayMedia={screenSharing.local}*/}
        {/*  screenSharingStreaming={screenSharing.remote}*/}
        {/*  isSidebarOpen={isSidebarOpen}*/}
        {/*  openSidebar={() => setIsSidebarOpen((prev) => !prev)}*/}
        {/*/>*/}

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
