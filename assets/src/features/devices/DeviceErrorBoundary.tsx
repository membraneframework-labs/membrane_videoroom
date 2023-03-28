import React, { FC, PropsWithChildren } from "react";
import useToast from "../shared/hooks/useToast";
import useEffectOnChange from "../shared/hooks/useEffectOnChange";
import { useLocalPeer } from "./LocalPeerContext";

const prepareErrorMessage = (videoDeviceError: string | null, audioDeviceError: string | null): null | string => {
  if (videoDeviceError && audioDeviceError) {
    return "Access to camera and microphone is blocked";
  } else if (videoDeviceError) {
    return "Access to camera is blocked";
  } else if (audioDeviceError) {
    return "Access to microphone is blocked";
  } else return null;
};

export const DeviceErrorBoundary: FC<PropsWithChildren> = ({ children }) => {
  const { addToast } = useToast();
  const { videoDeviceError, audioDeviceError } = useLocalPeer();

  useEffectOnChange(
    [videoDeviceError, audioDeviceError],
    () => {
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
