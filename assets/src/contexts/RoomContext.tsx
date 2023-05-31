import React, { createContext, FC, useCallback, useContext, useState } from "react";
import { RoomApi } from "../api";
import { BACKEND_URL, JELLYFISH_WEBSOCKET_URL } from "../pages/room/consts";
import axios from "axios";
import { useConnect } from "../jellifish.types";
import { useUser } from "./UserContext";

export type RoomContext = {
  token: string | null;
  join: (roomId: string) => void;
  setToken: (token: string | null) => void;
};

const RoomContext = createContext<RoomContext | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

const API = new RoomApi(undefined, BACKEND_URL, axios);

export const getToken = (roomId: string) =>
  API.videoroomWebRoomControllerShow(roomId).then((resp) => {
    console.log(resp);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const token = resp?.data?.data?.token || "";

    return token;
  });

export const RoomProvider: FC<Props> = ({ children }: Props) => {
  const [token, setToken] = useState<string | null>(null);
  // const [disconnect, setDisconnect] = useState<(() => void) | null>(null);
  // const connect = useConnect();
  // const { username } = useUser();

  const join = useCallback((roomId: string) => {
    // if (!username) {
    //   console.log("Username is empty!");
    //   return;
    // }
    console.log({ name: "Joining RoomId:", roomId });

    new RoomApi(undefined, BACKEND_URL, axios).videoroomWebRoomControllerShow(roomId).then((resp) => {
      console.log(resp);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const token = resp?.data?.data?.token || "";
      setToken(token);
      // const disconnect = connect({
      //   peerMetadata: { name: username },
      //   token: token,
      //   websocketUrl: JELLYFISH_WEBSOCKET_URL,
      // });
      //
      // setDisconnect(() => disconnect);
    });
  }, []);

  return <RoomContext.Provider value={{ token, join, setToken }}>{children}</RoomContext.Provider>;
};

export const useRoom = (): RoomContext => {
  const context = useContext(RoomContext);
  if (!context) throw new Error("useUser must be used within a RoomProvider");
  return context;
};
