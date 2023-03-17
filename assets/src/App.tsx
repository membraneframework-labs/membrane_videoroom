import React, { FC } from "react";
import { RouterProvider } from "react-router-dom";
import { DeveloperInfoProvider } from "./contexts/DeveloperInfoContext";
import { router } from "./Routes";
import { UserProvider } from "./contexts/UserContext";
import { ToastProvider } from "./features/shared/context/ToastContext";
import { PreviewSettingsProvider } from "./features/home-page/context/PreviewSettingsContext";
import { LocalPeerProvider } from "./contexts/LocalPeerContext";

const App: FC = () => {
  return (
    // <React.StrictMode>
      <UserProvider>
        <DeveloperInfoProvider>
          <PreviewSettingsProvider>
            <LocalPeerProvider>
              <ToastProvider>
                <RouterProvider router={router} />
              </ToastProvider>
            </LocalPeerProvider>
          </PreviewSettingsProvider>
        </DeveloperInfoProvider>
      </UserProvider>
    // </React.StrictMode>
  );
};

export default App;
