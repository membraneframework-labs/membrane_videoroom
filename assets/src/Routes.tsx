import React from "react";
import RoomPage from "./pages/room/RoomPage";
import { createBrowserRouter, useLocation, useParams } from "react-router-dom";
import { useDeveloperInfo } from "./contexts/DeveloperInfoContext";
import { useUser } from "./contexts/UserContext";
import VideoroomHomePage from "./features/home-page/components/VideoroomHomePage";
import LeavingRoomScreen from "./features/home-page/components/LeavingRoomScreen";
import { usePreviewSettings } from "./features/home-page/hooks/usePreviewSettings";

const RoomPageWrapper: React.FC = () => {
  const match = useParams();
  const roomId: string | undefined = match?.roomId;
  const { username } = useUser();
  const { simulcast, manualMode } = useDeveloperInfo();
  const { cameraAutostart, audioAutostart } = usePreviewSettings();

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

const HomePageWrapper = () => {
  const { state } = useLocation();
  const isLeavingRoom = !!state?.isLeavingRoom;
  const roomId = state?.roomId;

  return isLeavingRoom ? <LeavingRoomScreen roomId={roomId} /> : <VideoroomHomePage />;
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
