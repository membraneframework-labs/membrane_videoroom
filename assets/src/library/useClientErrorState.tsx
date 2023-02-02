import { Callbacks } from "@jellyfish-dev/membrane-webrtc-js";
import { useEffect, useMemo } from "react";
import {UseMembraneClientType} from "./state.types";

// TODO remove
export const useClientErrorState = <GenericPeerMetadata, GenericTrackMetadata>(
  clientWrapper: UseMembraneClientType<GenericPeerMetadata, GenericTrackMetadata> | null,
  setErrorMessage: (value: string) => void
) => {
  const callbacks: Partial<Callbacks> = useMemo(
    () => ({
      onConnectionError: (message) => {
        console.error("onConnectionError occurred");
        console.error(message);
        setErrorMessage(message);
      },
    }),
    [setErrorMessage]
  );

  useEffect(() => {
    if (!clientWrapper) return;

    clientWrapper.messageEmitter.on("onConnectionError", callbacks.onConnectionError);

    return () => {
      clientWrapper.messageEmitter.off("onConnectionError", callbacks.onConnectionError);
    };
  }, [callbacks, clientWrapper]);
};
