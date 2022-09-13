import { Room } from "./room";
import { populateVideoSources } from "./room_ui";

navigator.mediaDevices.addEventListener("devicechange", populateVideoSources);
populateVideoSources();

let room = new Room();
room.init().then(() => room.join());
