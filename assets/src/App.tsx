import React, { FC, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { DeveloperContext } from "./contexts/developerContext";
import { router } from "./Routes";
import { UserProvider } from "./contexts/UserContext";

const App: FC = () => {
  const [simulcast, setSimulcast] = useState<boolean>(false);
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [cameraAutostart, setCameraAutostart] = useState<boolean>(false);

  return (
    <React.StrictMode>
      <UserProvider>
        <DeveloperContext.Provider
          value={{
            simulcast: { status: simulcast, setSimulcast: setSimulcast },
            manualMode: { status: manualMode, setManualMode },
            cameraAutostart: { status: cameraAutostart, setCameraAutostart },
          }}
        >
          <RouterProvider router={router} />
        </DeveloperContext.Provider>
      </UserProvider>
    </React.StrictMode>
  );
};

export default App;
