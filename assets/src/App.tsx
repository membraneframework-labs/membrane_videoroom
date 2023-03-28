import React, { FC } from "react";
import { RouterProvider } from "react-router-dom";
import { DeveloperInfoProvider } from "./contexts/DeveloperInfoContext";
import { router } from "./Routes";
import { UserProvider } from "./contexts/UserContext";
import { ToastProvider } from "./features/shared/context/ToastContext";
import { ModalProvider } from "./contexts/ModalContext";
import { DeviceErrorBoundary } from "./features/devices/DeviceErrorBoundary";
import { LocalPeerProvider } from "./features/devices/LocalPeerContext";
import { MediaSettingsModal } from "./features/devices/MediaSettingsModal";

const App: FC = () => {
  return (
    <React.StrictMode>
      <UserProvider>
        <DeveloperInfoProvider>
          <LocalPeerProvider>
            <ToastProvider>
              <ModalProvider>
                <DeviceErrorBoundary>
                  <RouterProvider router={router} />
                  <MediaSettingsModal />
                </DeviceErrorBoundary>
              </ModalProvider>
            </ToastProvider>
          </LocalPeerProvider>
        </DeveloperInfoProvider>
      </UserProvider>
    </React.StrictMode>
  );
};

export default App;
