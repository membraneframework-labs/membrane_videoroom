import React from "react";
import RoomPage from "./pages/room/RoomPage";
import { createBrowserRouter, useLocation, useParams } from "react-router-dom";
import { useDeveloperInfo } from "./contexts/DeveloperInfoContext";
import { useUser } from "./contexts/UserContext";
import VideoroomHomePage from "./features/home-page/components/VideoroomHomePage";
import LeavingRoomScreen from "./features/home-page/components/LeavingRoomScreen";
import { usePreviewSettings } from "./features/home-page/hooks/usePreviewSettings";
import Page404 from "./features/shared/components/Page404";

const RoomPageWrapper: React.FC = () => {
  const match = useParams();
  const roomId: string | undefined = match?.roomId;
  const { state } = useLocation();
  const isLeavingRoom = !!state?.isLeavingRoom;
  const { username } = useUser();
  const { simulcast, manualMode } = useDeveloperInfo();
  const { cameraAutostart, audioAutostart } = usePreviewSettings();

  if (isLeavingRoom && roomId) {
    return <LeavingRoomScreen roomId={roomId} />;
  }

  return username && roomId ? (
    <RoomPage
      displayName={username}
      roomId={roomId}
      isSimulcastOn={simulcast.status}
      manualMode={manualMode.status}
      cameraAutostartStreaming={cameraAutostart.status}
      audioAutostartStreaming={audioAutostart.status}
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
  {
    path: "*",
    element: <Page404 />,
  },
]);
