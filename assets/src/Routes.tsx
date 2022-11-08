import React, { FC, useContext } from "react";
import RoomPage from "./pages/room/RoomPage";
import { HomePage } from "./pages/home/HomePage";
import { createBrowserRouter, useParams } from "react-router-dom";
import { UserContext } from "./contexts/userContext";
import { DeveloperContext } from "./contexts/developerContext";

const RoomPageWrapper: FC = () => {
  const match = useParams();
  const roomId: string | undefined = match?.roomId;
  const { username } = useContext(UserContext);
  const { simulcast, manualMode } = useContext(DeveloperContext);

  return username && roomId ? (
    <RoomPage displayName={username} roomId={roomId} isSimulcastOn={simulcast.status} manualMode={manualMode.status} />
  ) : (
    <HomePage />
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/room/:roomId",
    element: <RoomPageWrapper />,
  },
]);
