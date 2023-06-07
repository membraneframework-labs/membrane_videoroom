import axios from "axios";
import { RoomApi } from "./api";
import { BACKEND_URL } from "./pages/room/consts";

const API = new RoomApi(undefined, BACKEND_URL, axios);

export const getToken = (roomId: string) =>
  API.videoroomWebRoomControllerShow(roomId).then((resp) => {
    // console.log(resp);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const token = resp?.data?.data?.token || "";

    return token;
  });
