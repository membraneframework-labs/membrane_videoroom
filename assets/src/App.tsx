import React, { FC, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { UserContext } from "./contexts/userContext";
import { SimulcastContext } from "./contexts/simulcastContext";
import { router } from "./Routes";

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
