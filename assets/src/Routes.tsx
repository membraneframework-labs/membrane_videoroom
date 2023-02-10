import React, { FC } from "react";
import RoomPage from "./pages/room/RoomPage";
import { createBrowserRouter, useParams } from "react-router-dom";
import { useDeveloperInfo } from "./contexts/DeveloperInfoContext";
import { useUser } from "./contexts/UserContext";
import VideoroomHomePage from "./features/home-page/components/VideoroomHomePage";
import LeavingRoomPage from "./features/home-page/components/LeavingRoomPage";

const RoomPageWrapper: FC = () => {
  const match = useParams();
  const roomId: string | undefined = match?.roomId;
  const { username } = useUser();
  const { simulcast, manualMode, cameraAutostart } = useDeveloperInfo();

  return username && roomId ? (
    <RoomPage
      displayName={username}
      roomId={roomId}
      isSimulcastOn={simulcast.status}
      manualMode={manualMode.status}
      autostartStreaming={cameraAutostart.status}
    />
  ) : (
    <VideoroomHomePage />
  );
};

const HomePageWrapper = () => {
  const isLeaving = false; //TODO

  return isLeaving ? <LeavingRoomPage /> : <VideoroomHomePage />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePageWrapper />,
  },
  {
    path: "/room/:roomId",
    element: <RoomPageWrapper />,
  },
]);
