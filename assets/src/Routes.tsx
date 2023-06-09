import React from "react";
import RoomPage from "./pages/room/RoomPage";
import { createBrowserRouter, useLocation, useParams } from "react-router-dom";
import { useDeveloperInfo } from "./contexts/DeveloperInfoContext";
import { useUser } from "./contexts/UserContext";
import VideoroomHomePage from "./features/home-page/components/VideoroomHomePage";
import LeavingRoomScreen from "./features/leaving-page/LeavingRoomScreen";
import Page404 from "./features/shared/components/Page404";
import { WebrtcInternalsPage } from "./pages/webrtcInternals/WebrtcInternalsPage";
import useDynamicHeightResize from "./features/shared/hooks/useDynamicHeightResize";

const RoomPageWrapper: React.FC = () => {
  const match = useParams();
  const roomId: string | undefined = match?.roomId;
  const { state } = useLocation();
  const isLeavingRoom = !!state?.isLeavingRoom;
  const { username } = useUser();
  const { simulcast, manualMode } = useDeveloperInfo();
  useDynamicHeightResize();

  if (isLeavingRoom && roomId) {
    return <LeavingRoomScreen />;
  }

  return username && roomId ? (
    <RoomPage displayName={username} roomId={roomId} isSimulcastOn={simulcast.status} manualMode={manualMode.status} />
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
    path: "/webrtc-internals",
    element: <WebrtcInternalsPage />,
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
