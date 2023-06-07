import React, { FC, PropsWithChildren, useCallback, useEffect, useState } from "react";
import useToast from "../shared/hooks/useToast";
import { ErrorMessage, messageComparator } from "../../pages/room/errorMessage";
import { useJellyfishClient } from "../../jellifish.types";
import useEffectOnChange from "../shared/hooks/useEffectOnChange";
import { useLocalPeer } from "../devices/LocalPeerMediaContext";

export const StreamingErrorBoundary: FC<PropsWithChildren> = ({ children }) => {
  const { addToast } = useToast();

  // todo remove state, refactor to function invocation
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | undefined>();

  const client = useJellyfishClient();

  const handleError = useCallback(
    (text: string, id?: string) => {
      console.error(text);
      setErrorMessage({ message: text, id: id });
    },
    [setErrorMessage]
  );

  useEffect(() => {
    if (!client) return;

    const onSocketError = (_: Event) => {
      handleError(`Socket error occurred.`, "onSocketError");
    };

    const onConnectionError = (message: string) => {
      handleError(`Connection error occurred. ${message ?? ""}`);
    };
    const onJoinError = (_: unknown) => {
      handleError(`Failed to join the room`);
    };
    const onAuthError = () => {
      handleError(`Socket error occurred.`, "onAuthError");
    };

    const onSocketClose = () => {
      handleError(`onSocketClose`, "onSocketClose");
    };

    client.on("onSocketError", onSocketError);
    client.on("onConnectionError", onConnectionError);
    client.on("onJoinError", onJoinError);
    client.on("onAuthError", onAuthError);
    client.on("onSocketClose", onSocketClose);

    return () => {
      client.off("onSocketError", onSocketError);
      client.off("onConnectionError", onConnectionError);
      client.off("onJoinError", onJoinError);
      client.off("onAuthError", onAuthError);
      client.off("onSocketClose", onSocketClose);
    };
  }, [client, handleError]);

  const { screenShare } = useLocalPeer();

  useEffectOnChange(screenShare.device.stream, () => {
    if (screenShare.device.stream) {
      addToast({ id: "screen-sharing", message: "You are sharing the screen now", timeout: 4000 });
    }
  });

  useEffectOnChange(
    errorMessage,
    () => {
      if (errorMessage) {
        addToast({
          id: errorMessage.id || crypto.randomUUID(),
          message: errorMessage.message,
          timeout: "INFINITY",
          type: "error",
        });
      }
    },
    messageComparator
  );

  return <>{children}</>;
};
