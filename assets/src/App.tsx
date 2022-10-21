import React, { FC, useContext, useState } from "react";
import RoomPage from "./pages/room/RoomPage";
import { HomePage } from "./pages/home/HomePage";
import { createBrowserRouter, RouterProvider, useParams } from "react-router-dom";
import { UserContext } from "./contexts/userContext";
import { SimulcastContext } from "./contexts/simulcastContext";

const RoomPageWrapper: FC = () => {
  const match = useParams();
  const roomId: string | undefined = match?.roomId;
  const { username } = useContext(UserContext);
  const { simulcast } = useContext(SimulcastContext);

  console.log({ roomId, username });

  return username && roomId ? (
    <RoomPage displayName={username} roomId={roomId} isSimulcastOn={simulcast} />
  ) : (
    <HomePage />
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/room/:roomId",
    element: <RoomPageWrapper />,
  },
]);

const App: FC = () => {
  const [username, setUsername] = useState<string>("");
  const [simulcast, setSimulcast] = useState<boolean>(false);

  return (
    <React.StrictMode>
      <UserContext.Provider value={{ username, setUsername }}>
        <SimulcastContext.Provider value={{ simulcast, setSimulcast }}>
          <RouterProvider router={router} />
        </SimulcastContext.Provider>
      </UserContext.Provider>
    </React.StrictMode>
  );
};

// todo implement WakeLock

export default App;
