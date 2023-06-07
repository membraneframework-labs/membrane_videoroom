import React, { FC, useEffect, useState } from "react";
import MediaControlButtons from "./components/MediaControlButtons";
import { useToggle } from "./hooks/useToggle";
import { VideochatSection } from "./VideochatSection";
import PageLayout from "../../features/room-page/components/PageLayout";
import { useAcquireWakeLockAutomatically } from "./hooks/useAcquireWakeLockAutomatically";
import clsx from "clsx";
import RoomSidebar from "./RoomSidebar";
import { useConnect } from "../../jellifish.types";
import { useDeveloperInfo } from "../../contexts/DeveloperInfoContext";
import { useUser } from "../../contexts/UserContext";
import { JELLYFISH_WEBSOCKET_URL } from "./consts";
import { getToken } from "../../room.api";

type ConnectComponentProps = {
  username: string;
  roomId: string;
};

const ConnectComponent: FC<ConnectComponentProps> = ({ username, roomId }) => {
  const connect = useConnect();

  useEffect(() => {
    const disconnectPromise = getToken(roomId).then((token) => {
      return connect({
        peerMetadata: { name: username },
        token: token,
        websocketUrl: JELLYFISH_WEBSOCKET_URL,
      });
    });

    return () => {
      disconnectPromise.then((disconnect) => {
        disconnect();
      });
    };
    // todo think about it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};

type Props = {
  roomId: string;
};

const RoomPage: FC<Props> = ({ roomId }: Props) => {
  useAcquireWakeLockAutomatically();

  const { simulcast } = useDeveloperInfo();
  const isSimulcastOn = simulcast.status;

  const [showSimulcastMenu, toggleSimulcastMenu] = useToggle(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { username } = useUser();

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
