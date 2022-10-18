import React, { FC } from "react";
import RoomPage from "./pages/room/RoomPage";
import { HomePage } from "./pages/home/HomePage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/room/:roomId",
    element: <RoomPage />,
  },
]);

// todo add routing and homescreen
const App: FC = () => (
  <React.StrictMode>
    <section className="phx-hero">
      <RouterProvider router={router} />
    </section>
  </React.StrictMode>
);

// todo implement WakeLock

export default App;
