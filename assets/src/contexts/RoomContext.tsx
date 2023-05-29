import React, { createContext, FC, useCallback, useContext, useState } from "react";
import { RoomApi } from "../api";
import { BACKEND_URL } from "../pages/room/consts";
import axios from "axios/index";

export type RoomContext = {
  token: string | null;
  join: (roomId: string) => void;
};

const RoomContext = createContext<RoomContext | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export const RoomProvider: FC<Props> = ({ children }: Props) => {
  const [token, setToken] = useState<string | null>(null);

  const join = useCallback((roomId: string) => {
    new RoomApi(undefined, BACKEND_URL, axios).videoroomWebRoomControllerShow(roomId).then((resp) => {
      console.log(resp);
      // @ts-ignore
      const token = resp?.data?.data?.token || "";
      setToken(token);
    });
  }, []);

  return <RoomContext.Provider value={{ token, join }}>{children}</RoomContext.Provider>;
};

export const useRoom = (): RoomContext => {
  const context = useContext(RoomContext);
  if (!context) throw new Error("useUser must be used within a RoomProvider");
  return context;
};
