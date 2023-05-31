import React, { FC, useCallback, useEffect, useState } from "react";
import MediaControlButtons from "./components/MediaControlButtons";
import { useToggle } from "./hooks/useToggle";
import { VideochatSection } from "./VideochatSection";
import PageLayout from "../../features/room-page/components/PageLayout";
import useToast from "../../features/shared/hooks/useToast";
import useEffectOnChange from "../../features/shared/hooks/useEffectOnChange";
import { ErrorMessage, messageComparator } from "./errorMessage";
import { useAcquireWakeLockAutomatically } from "./hooks/useAcquireWakeLockAutomatically";
import clsx from "clsx";
import { useLocalPeer } from "../../features/devices/LocalPeerMediaContext";
import RoomSidebar from "./RoomSidebar";
import { useJellyfishClient, useConnect, useSelector } from "../../jellifish.types";
import { useDeveloperInfo } from "../../contexts/DeveloperInfoContext";
import { useUser } from "../../contexts/UserContext";
import { getToken, useRoom } from "../../contexts/RoomContext";
import { JELLYFISH_WEBSOCKET_URL } from "./consts";

type ConnectComponentProps = {
  username: string;
  roomId: string;
  // setToken: (token: string | null) => void;
};

const ConnectComponent: FC<ConnectComponentProps> = ({ username, roomId }) => {
  const connect = useConnect();
  // const { username } = useUser();
  // const { disconnect } = useRoom();

  useEffect(() => {
    // if (!username) throw Error("Username is null");
    // if (!token) return;
    //
    // console.log({token})
    console.log("Invoke function 'connect'!");
    const disconnectPromise = getToken(roomId).then((token) => {
      console.log({ token });
      return connect({
        peerMetadata: { name: username },
        token: token,
        websocketUrl: JELLYFISH_WEBSOCKET_URL,
      });
    });

    return () => {
      // console.log("Invoke function 'disconnect'!");
      // setToken(null);
      disconnectPromise.then((disconnect) => {
        disconnect();
      });
    };
  }, []);

  return <></>;
};

type Props = {
  roomId: string;
  // username: string;
  // token: string;
};

const RoomPage: FC<Props> = ({ roomId }: Props) => {
  useAcquireWakeLockAutomatically();

  const { simulcast } = useDeveloperInfo();
  const isSimulcastOn = simulcast.status;

  // todo handle errors
  // const [errorMessage, setErrorMessage] = useState<ErrorMessage | undefined>();
  //
  const client = useJellyfishClient();
  //
  // const handleError = useCallback(
  //   (text: string, id?: string) => {
  //     console.error(text);
  //     setErrorMessage({ message: text, id: id });
  //   },
  //   [setErrorMessage]
  // );
  //
  // useEffect(() => {
  //   if (!client) return;
  //
  //   const onSocketError = () => {
  //     handleError(`Socket error occurred.`, "socket-error");
  //   };
  //
  //   const onConnectionError = (message: string) => {
  //     handleError(`Connection error occurred. ${message ?? ""}`);
  //   };
  //   const onJoinError = (metadata: unknown) => {
  //     console.error(metadata);
  //
  //     handleError(`Failed to join the room`);
  //   };
  //   const onAuthError = () => {
  //     handleError(`Socket error occurred.`, "socket-error");
  //   };
  //
  //   client.on("onSocketError", onSocketError);
  //   client.on("onConnectionError", onConnectionError);
  //   client.on("onJoinError", onJoinError);
  //   client.on("onAuthError", onAuthError);
  //
  //   return () => {
  //     client.off("onSocketError", onSocketError);
  //     client.off("onConnectionError", onConnectionError);
  //     client.off("onJoinError", onJoinError);
  //     client.off("onAuthError", onAuthError);
  //   };
  // }, [client, handleError]);

  const [showSimulcastMenu, toggleSimulcastMenu] = useToggle(false);

  const state = useSelector((s) => s);
  useEffect(() => {
    console.log({ state });
  }, [state]);

  const { screenShare } = useLocalPeer();

  const { addToast } = useToast();

  useEffectOnChange(screenShare.device.stream, () => {
    if (screenShare.device.stream) {
      addToast({ id: "screen-sharing", message: "You are sharing the screen now", timeout: 4000 });
    }
  });

  // useEffectOnChange(
  //   errorMessage,
  //   () => {
  //     if (errorMessage) {
  //       addToast({
  //         id: errorMessage.id || crypto.randomUUID(),
  //         message: errorMessage.message,
  //         timeout: "INFINITY",
  //         type: "error",
  //       });
  //     }
  //   },
  //   messageComparator
  // );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const connect = useConnect();
  const { username } = useUser();
  // const { token, setToken } = useRoom();

  // useEffect(() => {
  //   // if (!username) throw Error("Username is null");
  //   // if (!token) return;
  //   //
  //   // console.log({token})
  //   // console.log("Invoke function 'connect'!")
  //
  //   const disconnect = connect({
  //     peerMetadata: { name: username },
  //     token: token,
  //     websocketUrl: JELLYFISH_WEBSOCKET_URL,
  //   });
  //
  //   return () => {
  //     console.log("Invoke function 'disconnect'!");
  //     disconnect?.();
  //   };
  // }, [connect, token, username]);

  return (
    <PageLayout>
      {username && <ConnectComponent username={username} roomId={roomId} />}
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

        <MediaControlButtons isSidebarOpen={isSidebarOpen} openSidebar={() => setIsSidebarOpen((prev) => !prev)} />

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
