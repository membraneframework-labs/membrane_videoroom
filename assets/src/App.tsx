import React, { FC } from "react";
import { RouterProvider } from "react-router-dom";
import { DeveloperInfoProvider } from "./contexts/DeveloperInfoContext";
import { router } from "./Routes";
import { UserProvider } from "./contexts/UserContext";
import { ToastProvider } from "./features/shared/context/ToastContext";
import { LocalPeerProvider } from "./contexts/LocalPeerContext";
import { MediaSettingsModal } from "./features/shared/components/modal/MediaSettingsModal";
import { ModalProvider } from "./contexts/ModalContext";

const App: FC = () => {
  return (
    <React.StrictMode>
      <UserProvider>
        <DeveloperInfoProvider>
          <LocalPeerProvider>
            <ToastProvider>
              <ModalProvider>
                <RouterProvider router={router} />
                <MediaSettingsModal />
              </ModalProvider>
            </ToastProvider>
          </LocalPeerProvider>
        </DeveloperInfoProvider>
      </UserProvider>
    </React.StrictMode>
  );
};

export default App;
