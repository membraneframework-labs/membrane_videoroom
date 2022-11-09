import React, { FC, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { UserContext } from "./contexts/userContext";
import { DeveloperContext } from "./contexts/developerContext";
import { router } from "./Routes";

const App: FC = () => {
  const [username, setUsername] = useState<string>("");
  const [simulcast, setSimulcast] = useState<boolean>(false);
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [cameraAutostart, setCameraAutostart] = useState<boolean>(false);

  return (
    <React.StrictMode>
      <UserContext.Provider value={{ username, setUsername }}>
        <DeveloperContext.Provider
          value={{
            simulcast: { status: simulcast, setSimulcast: setSimulcast },
            manualMode: { status: manualMode, setManualMode },
            cameraAutostart: { status: cameraAutostart, setCameraAutostart },
          }}
        >
          <RouterProvider router={router} />
        </DeveloperContext.Provider>
      </UserContext.Provider>
    </React.StrictMode>
  );
};

// todo implement WakeLock

export default App;
