import React, { FC } from "react";
import { RouterProvider } from "react-router-dom";
import { DeveloperInfoProvider } from "./contexts/DeveloperInfoContext";
import { router } from "./Routes";
import { UserProvider } from "./contexts/UserContext";
import { ToastProvider } from "./features/shared/context/ToastContext";
import { ModalProvider } from "./contexts/ModalContext";
import { DeviceErrorBoundary } from "./features/devices/DeviceErrorBoundary";
import { LocalPeerMediaProvider } from "./features/devices/LocalPeerMediaContext";
import { MediaSettingsModal } from "./features/devices/MediaSettingsModal";

// https://stackoverflow.com/questions/8788802/prevent-safari-loading-from-cache-when-back-button-is-clicked
window.onpageshow = function(event) {
  if (event.persisted) {
    window.location.reload()
  }
};

const App: FC = () => {
  return (
    <React.StrictMode>
      <UserProvider>
        <DeveloperInfoProvider>
          <LocalPeerMediaProvider>
            <ToastProvider>
              <ModalProvider>
                <DeviceErrorBoundary>
                  <RouterProvider router={router} />
                  <MediaSettingsModal />
                </DeviceErrorBoundary>
              </ModalProvider>
            </ToastProvider>
          </LocalPeerMediaProvider>
        </DeveloperInfoProvider>
      </UserProvider>
    </React.StrictMode>
  );
};

export default App;
