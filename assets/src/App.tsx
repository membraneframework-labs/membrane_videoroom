import React, { FC, PropsWithChildren } from "react";
import { RouterProvider } from "react-router-dom";
import { DeveloperInfoProvider } from "./contexts/DeveloperInfoContext";
import { router } from "./Routes";
import { UserProvider } from "./contexts/UserContext";
import { ToastProvider } from "./features/shared/context/ToastContext";
import { LocalPeerProvider, useLocalPeer } from "./contexts/LocalPeerContext";
import { MediaSettingsModal } from "./features/shared/components/modal/MediaSettingsModal";
import { ModalProvider } from "./contexts/ModalContext";
import useToast from "./features/shared/hooks/useToast";
import useEffectOnChange from "./features/shared/hooks/useEffectOnChange";

const prepareErrorMessage = (videoDeviceError: string | null, audioDeviceError: string | null): null | string => {
  if (videoDeviceError && audioDeviceError) {
    return "Camera and microphone not allowed";
  } else if (videoDeviceError) {
    return "Camera not allowed";
  } else if (audioDeviceError) {
    return "Microphone not allowed";
  } else return null;
};

const Something: FC<PropsWithChildren> = ({ children }) => {
  const { addToast } = useToast();
  const { videoDeviceError, audioDeviceError } = useLocalPeer();

  useEffectOnChange(
    [videoDeviceError, audioDeviceError],
    () => {
      console.log({ audioDeviceError, videoDeviceError });
      const message = prepareErrorMessage(videoDeviceError, audioDeviceError);

      if (message) {
        addToast({
          id: "device-not-allowed-error",
          message: message,
          timeout: "INFINITY",
          type: "error",
        });
      }
    },
    (next, prev) => prev?.[0] === next[0] && prev?.[1] === next[1]
  );

  return <>{children}</>;
};

const App: FC = () => {
  return (
    <React.StrictMode>
      <UserProvider>
        <DeveloperInfoProvider>
          <LocalPeerProvider>
            <ToastProvider>
              <ModalProvider>
                <Something>
                  <RouterProvider router={router} />
                  <MediaSettingsModal />
                </Something>
              </ModalProvider>
            </ToastProvider>
          </LocalPeerProvider>
        </DeveloperInfoProvider>
      </UserProvider>
    </React.StrictMode>
  );
};

export default App;
