import { Room } from "./room";
import { populateVideoSources } from "./room_ui";

let room = new Room();
room.init().then(() => room.join());
