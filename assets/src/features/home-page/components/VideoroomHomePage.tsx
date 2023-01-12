import clsx from "clsx";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import Button from "../../shared/components/Button";
import Input from "../../shared/components/Input";
import HomePageLayout from "./HomePageLayout";

const VideoroomHomePage: React.FC = () => {
  const lastDisplayName: string | null = localStorage.getItem("displayName");
  const [displayNameInput, setDisplayNameInput] = useState(lastDisplayName || "");
  const match = useParams();
  const { setUsername } = useUser();

  const roomId: string = match?.roomId || "";
  const [roomIdInput, setRoomIdInput] = useState<string>(roomId);
  const buttonDisabled = !displayNameInput || !roomIdInput;

  return (
    <HomePageLayout>
      <section className="flex flex-col items-center gap-y-18">
        <div className="flex flex-col items-center gap-y-6 text-center">
          <h2 className="text-3xl sm:text-5xl">Videoconferencing for everyone</h2>
          <p className="font-aktivGrotesk text-xl">Join the existing room or create a new one to start the meeting</p>
        </div>
        <div className="flex flex-col gap-y-6">
          <Input
            value={roomIdInput}
            onChange={(event) => setRoomIdInput(event.target.value)}
            type="text"
            required
            name="room_name"
            placeholder="Room name"
            label="Room name"
            disabled={!!roomId}
            className="w-80 sm:w-96"
          />
          <Input
            value={displayNameInput}
            onChange={(event) => setDisplayNameInput(event.target.value)}
            name="display_name"
            type="text"
            placeholder="Display name"
            label="Your name"
            className="w-80 sm:w-96"
          />
          <div className="flex items-center justify-center w-full">
            <Button
              onClick={() => {
                localStorage.setItem("displayName", displayNameInput);
                setUsername(displayNameInput);
              }}
              href={`/room/${roomIdInput}`}
              name="join"
              className={clsx("btn")}
              disabled={buttonDisabled}
            >
              Join the room
            </Button>
          </div>
        </div>
      </section>
    </HomePageLayout>
  );
};

export default VideoroomHomePage;
