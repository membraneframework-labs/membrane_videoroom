import React, { FC, PropsWithChildren } from "react";
import useToast from "../shared/hooks/useToast";
import useEffectOnChange from "../shared/hooks/useEffectOnChange";
import { useLocalPeer } from "./LocalPeerMediaContext";

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
  const { video, audio } = useLocalPeer();

  useEffectOnChange(
    [video.error, audio.error],
    () => {
      // console.log({video, audio})
      const message = prepareErrorMessage(video.error, audio.error);

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
