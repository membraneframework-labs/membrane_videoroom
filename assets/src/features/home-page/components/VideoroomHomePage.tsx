import clsx from "clsx";
import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDeveloperInfo } from "../../../contexts/DeveloperInfoContext";
import { useUser } from "../../../contexts/UserContext";
import { DEFAULT_MANUAL_MODE_CHECKBOX_VALUE } from "../../../pages/room/consts";
import { useMediaDeviceManager } from "../../../pages/room/hooks/useMediaDeviceManager";
import { useToggle } from "../../../pages/room/hooks/useToggle";
import Button from "../../shared/components/Button";
import { Checkbox, CheckboxProps } from "../../shared/components/Checkbox";
import Input from "../../shared/components/Input";
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
  const { simulcast, manualMode } = useDeveloperInfo();

  const [searchParams] = useSearchParams();
  const simulcastParam: string = searchParams?.get("simulcast") || "true";
  const simulcastDefaultValue: boolean = simulcastParam === "true";
  const [simulcastInput, toggleSimulcastCheckbox] = useToggle(simulcastDefaultValue);

  const [manualModeInput, toggleManualModeCheckbox] = useToggle(DEFAULT_MANUAL_MODE_CHECKBOX_VALUE);

  const checkboxes: CheckboxProps[] = [
    {
      label: "Simulcast",
      id: "simulcast",
      onChange: toggleSimulcastCheckbox,
      status: simulcastInput,
    },
    {
      label: "Manual mode",
      id: "manual-mode",
      onChange: toggleManualModeCheckbox,
      status: manualModeInput,
    },
  ];

  return (
    <HomePageLayout>
      <section className="flex flex-col items-center gap-y-12 sm:justify-around sm:gap-y-0">
        {deviceManager.errorMessage && (
          <div className="w-full bg-red-700 p-1 text-white">{deviceManager.errorMessage}</div>
        )}
        <div className="flex flex-col items-center gap-y-6 text-center">
          <h2 className="text-3xl sm:text-5xl">Videoconferencing for everyone</h2>
          <p className="font-aktivGrotesk text-xl">Join the existing room or create a new one to start the meeting</p>
        </div>
        <div className="flex max-h-[400px] w-full flex-col justify-between gap-x-24 gap-y-8 sm:flex-row 2xl:max-h-[500px]">
          <div className="h-full w-full sm:h-[400px] sm:max-w-[600px] 2xl:h-[500px] 2xl:w-[750px] 2xl:max-w-none">
            <HomePageVideoTile displayName={displayNameInput} />
          </div>
          <div className={clsx("flex flex-col items-center justify-center", roomId ? "gap-y-12" : "gap-y-6")}>
            {roomId ? (
              <div className="flex w-full flex-col items-center justify-center text-center">
                <span>You are joining:</span>
                <span className="text-2xl font-medium">{roomId}</span>
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
                className="w-80 sm:w-96"
              />
            )}
            <Input
              value={displayNameInput}
              onChange={(event) => setDisplayNameInput(event.target.value)}
              name="display_name"
              type="text"
              placeholder="Display name"
              label="Your name"
              className="w-80 sm:w-96"
            />
            <div className="hidden space-y-1 sm:block">
              {checkboxes.map(({ label, id, status, onChange }) => (
                <Checkbox key={id} label={label} id={id} status={status} onChange={onChange} />
              ))}
            </div>
            <div className="flex w-full items-center justify-center">
              <Button
                onClick={() => {
                  localStorage.setItem("displayName", displayNameInput);
                  setUsername(displayNameInput);
                  simulcast.setSimulcast(simulcastInput);
                  manualMode.setManualMode(manualModeInput);
                }}
                href={`/room/${roomIdInput}`}
                name="join"
                variant="normal"
                disabled={buttonDisabled}
              >
                Join the room
              </Button>
            </div>
          </div>
        </div>
      </section>
    </HomePageLayout>
  );
};

export default VideoroomHomePage;
