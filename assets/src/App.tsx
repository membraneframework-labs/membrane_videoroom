import React, { FC } from "react";
import { RouterProvider } from "react-router-dom";
import { DeveloperInfoProvider } from "./contexts/DeveloperInfoContext";
import { router } from "./Routes";
import { UserProvider } from "./contexts/UserContext";
import { MembraneContextProvider } from "./libraryUsage/setup";
import { ToastProvider } from "./features/shared/context/ToastContext";

const App: FC = () => {
  return (
    <React.StrictMode>
      <UserProvider>
        <DeveloperInfoProvider>
          <MembraneContextProvider>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </MembraneContextProvider>
        </DeveloperInfoProvider>
      </UserProvider>
    </React.StrictMode>
  );
};

export default App;
