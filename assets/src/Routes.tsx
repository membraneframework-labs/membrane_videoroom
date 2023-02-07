import type { FC } from "react";
import React from "react";
import RoomPage from "./pages/room/RoomPage";
import { createBrowserRouter, useParams } from "react-router-dom";
import { useDeveloperInfo } from "./contexts/DeveloperInfoContext";
import { useUser } from "./contexts/UserContext";
import VideoroomHomePage from "./features/home-page/components/VideoroomHomePage";

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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <VideoroomHomePage />,
  },
  {
    path: "/room/:roomId",
    element: <RoomPageWrapper />,
  },
]);
