import React, { FC, PropsWithChildren, useCallback, useEffect, useState } from "react";
import useToast from "../shared/hooks/useToast";
import { ErrorMessage, messageComparator } from "../../pages/room/errorMessage";
import { useJellyfishClient } from "../../jellifish.types";
import useEffectOnChange from "../shared/hooks/useEffectOnChange";
import {useLocalPeer} from "../devices/LocalPeerMediaContext";

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
    // console.log({ name: "Try register callback", client });
    if (!client) return;

    const id = client.id;

    // console.log({ name: "Registering", client, id });

    const onSocketError = (event: Event) => {
      console.log({ name: "onSocketError", event, id });
      handleError(`Socket error occurred.`, "onSocketError");
    };

    const onConnectionError = (message: string) => {
      console.log({ name: "onConnectionError", message, id });
      handleError(`Connection error occurred. ${message ?? ""}`);
    };
    const onJoinError = (metadata: unknown) => {
      console.error({ name: "onJoinError", metadata, id });

      handleError(`Failed to join the room`);
    };
    const onAuthError = () => {
      console.log({ name: "onAuthError", id });
      handleError(`Socket error occurred.`, "onAuthError");
    };

    const onSocketClose = () => {
      console.log({name: "onSocketClose", id});
      handleError(`onSocketClose`, "onSocketClose");
    };

    client.on("onSocketError", onSocketError);
    client.on("onConnectionError", onConnectionError);
    client.on("onJoinError", onJoinError);
    client.on("onAuthError", onAuthError);
    client.on("onSocketClose", onSocketClose);

    return () => {
      // console.log("Unregister!");
      client.off("onSocketError", onSocketError);
      client.off("onConnectionError", onConnectionError);
      client.off("onJoinError", onJoinError);
      client.off("onAuthError", onAuthError);
      client.off("onSocketClose", onSocketClose);
    };
  }, [client, handleError]);

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
