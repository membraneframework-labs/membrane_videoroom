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
import { disableSafariCache } from "./features/devices/disableSafariCache";
import { JellyfishContextProvider } from "./jellifish.types";
import { StreamingProvider } from "./features/streaming/StreamingContext";
import { RoomProvider } from "./contexts/RoomContext";
import { StreamingErrorBoundary } from "./features/streaming/StreamingErrorBoundary";

// When returning to the videoroom page from another domain using the 'Back' button on the Safari browser,
// the page is served from the cache, which prevents lifecycle events from being triggered.
// As a result, the camera and microphone do not start. To resolve this issue, one simple solution is to disable the cache.
disableSafariCache();

const App: FC = () => {
  return (
    <React.StrictMode>
      <UserProvider>
        <DeveloperInfoProvider>
          <LocalPeerMediaProvider>
            <ToastProvider>
              <ModalProvider>
                <DeviceErrorBoundary>
                  <JellyfishContextProvider>
                    <RoomProvider>
                      <StreamingErrorBoundary>
                        <StreamingProvider>
                          <RouterProvider router={router} />
                          <MediaSettingsModal />
                        </StreamingProvider>
                      </StreamingErrorBoundary>
                    </RoomProvider>
                  </JellyfishContextProvider>
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
