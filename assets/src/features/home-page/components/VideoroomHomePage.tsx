import clsx from "clsx";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useDeveloperInfo } from "../../../contexts/DeveloperInfoContext";
import { useUser } from "../../../contexts/UserContext";
import { useMediaDeviceManager } from "../../../pages/room/hooks/useMediaDeviceManager";
import Button from "../../shared/components/Button";
import Input from "../../shared/components/Input";
import useMobile from "../../shared/hooks/useMobile";
import HomePageLayout from "./HomePageLayout";

import HomePageVideoTile from "./HomePageVideoTile";

const VideoroomHomePage: React.FC = () => {
  const lastDisplayName: string | null = localStorage.getItem("displayName");
  const [displayNameInput, setDisplayNameInput] = useState(lastDisplayName || "");
  const match = useParams();
  const { setUsername } = useUser();

  const roomId: string = match?.roomId || "";
  const [roomIdInput, setRoomIdInput] = useState<string>(roomId);
  const buttonDisabled = !displayNameInput || !roomIdInput;

  const deviceManager = useMediaDeviceManager({ askOnMount: true });
  const { simulcast } = useDeveloperInfo();

  const isMobile = useMobile();

  return (
    <HomePageLayout>
      <section className="flex w-full flex-col items-center justify-center gap-y-12 sm:w-auto sm:justify-around sm:gap-y-0">
        {deviceManager.errorMessage && (
          <div className="w-full bg-red-700 p-1 text-white">{deviceManager.errorMessage}</div>
        )}
        <div className="flex flex-col items-center gap-y-2 text-center sm:gap-y-6">
          <h2 className="text-xl font-medium sm:text-5xl">Videoconferencing for everyone</h2>
          <p className="hidden font-aktivGrotesk sm:inline-block sm:text-xl">
            Join the existing room or create a new one to start the meeting
          </p>
          <p className="font-aktivGrotesk text-sm sm:hidden">
            {roomId ? "Join the existing room" : "Create a new room to start the meeting"}
          </p>
        </div>
        <div className="flex w-full flex-col justify-between gap-x-24 gap-y-8 sm:max-h-[400px] sm:flex-row 2xl:max-h-[500px]">
          {isMobile && roomId && (
            <div className="h-[300px] w-[210px] self-center">
              <HomePageVideoTile displayName={displayNameInput} />
            </div>
          )}
          <div className="hidden h-full w-full sm:inline-block sm:h-[400px] sm:max-w-[600px] 2xl:h-[500px] 2xl:w-[750px] 2xl:max-w-none">
            <HomePageVideoTile displayName={displayNameInput} />
          </div>
          <div
            className={clsx(
              "flex w-full flex-col items-center justify-center gap-y-6 sm:w-auto",
              roomId ? "sm:gap-y-12" : "sm:gap-y-6"
            )}
          >
            {roomId ? (
              <div className="flex w-full items-center justify-center gap-x-2 text-center text-lg font-medium sm:flex-col sm:text-base sm:font-normal">
                <span>You are joining:</span>
                <span className="sm:text-2xl sm:font-medium">{roomId}</span>
              </div>
            ) : (
              <Input
                value={roomIdInput}
                onChange={(event) => setRoomIdInput(event.target.value)}
                type="text"
                required
                name="room_name"
                placeholder="Room name"
                label="Room name"
                disabled={!!roomId}
                className="w-full sm:w-96"
              />
            )}
            <Input
              value={displayNameInput}
              onChange={(event) => setDisplayNameInput(event.target.value)}
              name="display_name"
              type="text"
              placeholder="Display name"
              label="Your name"
              className="w-full sm:w-96"
            />
            <div className="mt-4 flex w-full items-center justify-center">
              <Button
                onClick={() => {
                  localStorage.setItem("displayName", displayNameInput);
                  setUsername(displayNameInput);
                  simulcast.setSimulcast(true); //always join the room with simulcast turned on
                }}
                href={`/room/${roomIdInput}`}
                name="join"
                variant="normal"
                disabled={buttonDisabled}
                className="w-full sm:w-auto"
              >
                <span className="hidden sm:inline-block">Join the room</span>
                <span className="sm:hidden">{roomId ? "Join the room" : "Create a room"}</span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </HomePageLayout>
  );
};

export default VideoroomHomePage;
