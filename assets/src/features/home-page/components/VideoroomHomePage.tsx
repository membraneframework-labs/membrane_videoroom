import clsx from "clsx";
import React, { useMemo, useState } from "react";
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

type StepType = "create-room" | "preview-settings";

type Step = { content: JSX.Element; button: JSX.Element };

const VideoroomHomePage: React.FC = () => {
  const lastDisplayName: string | null = localStorage.getItem("displayName");
  const [displayNameInput, setDisplayNameInput] = useState(lastDisplayName || "");
  const match = useParams();
  const { setUsername } = useUser();

  const roomId: string = match?.roomId || "";
  const joiningExistingRoom = !!roomId;
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

  const inputs = useMemo(() => {
    return (
      <>
        {joiningExistingRoom ? (
          <div className="mt-2 flex w-full items-center justify-center gap-x-2 text-center text-lg font-medium sm:mt-0 sm:flex-col sm:text-base sm:font-normal">
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
      </>
    );
  }, [displayNameInput, joiningExistingRoom, roomId, roomIdInput]);

  const [mobileCurrentLoginStep, setMobileCurrentLoginStep] = useState<StepType>(
    joiningExistingRoom ? "preview-settings" : "create-room"
  );
  const mobileLoginSteps: Record<StepType, Step> = {
    "create-room": {
      content: inputs,
      button: (
        <Button
          onClick={() => {
            setMobileCurrentLoginStep("preview-settings");
          }}
          name="create-room"
          variant="normal"
          disabled={buttonDisabled}
          className="mt-9 w-full"
        >
          <span className="">Create a room</span>
        </Button>
      ),
    },
    "preview-settings": {
      content: (
        <>
          <div className="h-[300px] w-[210px] self-center">
            <HomePageVideoTile displayName={displayNameInput} />
          </div>
          {joiningExistingRoom && inputs}
        </>
      ),
      button: (
        <>
          <Button
            href={`/room/${roomIdInput}`}
            name="join-a-room"
            variant="normal"
            className="mt-2 w-full"
            onClick={() => {
              localStorage.setItem("displayName", displayNameInput);
              setUsername(displayNameInput);
              simulcast.setSimulcast(simulcastInput);
              manualMode.setManualMode(manualModeInput);
            }}
          >
            <span className="">Join the room</span>
          </Button>
          {!joiningExistingRoom && (
            <Button
              onClick={() => {
                setMobileCurrentLoginStep("create-room");
              }}
              name="back-to-previous-step"
              variant="light"
              className="w-full"
            >
              <span className="">Back</span>
            </Button>
          )}
        </>
      ),
    },
  };

  return (
    <HomePageLayout>
      <section className="flex w-full flex-col items-center justify-center gap-y-8 sm:w-auto sm:justify-around sm:gap-y-0">
        {deviceManager.errorMessage && (
          <div className="w-full bg-red-700 p-1 text-white">{deviceManager.errorMessage}</div>
        )}
        <div className="flex flex-col items-center gap-y-2 text-center sm:gap-y-6">
          <h2 className="text-xl font-medium sm:text-5xl">Videoconferencing for everyone</h2>
          <p className="hidden font-aktivGrotesk sm:inline-block sm:text-xl">
            Join the existing room or create a new one to start the meeting
          </p>
          <p className="font-aktivGrotesk text-sm sm:hidden">
            {joiningExistingRoom ? "Join the existing room" : "Create a new room to start the meeting"}
          </p>
        </div>

        <div className="flex w-full flex-col items-center justify-between gap-x-12 sm:max-h-[400px] sm:flex-row lg:gap-x-24 2xl:max-h-[500px]">
          {/* mobile view */}
          <div className="flex w-full flex-col items-center gap-y-6 sm:hidden">
            {mobileLoginSteps[mobileCurrentLoginStep].content}
            {mobileLoginSteps[mobileCurrentLoginStep].button}
            {!joiningExistingRoom && (
              <div className="font-aktivGrotesk text-xs">
                Step {Object.values(mobileLoginSteps).indexOf(mobileLoginSteps[mobileCurrentLoginStep]) + 1} /{" "}
                {Object.values(mobileLoginSteps).length}
              </div>
            )}
          </div>

          {/* desktop view */}
          <>
            <div className="hidden h-full w-full sm:inline-block sm:h-[400px] sm:max-w-[600px] 2xl:h-[500px] 2xl:w-[750px] 2xl:max-w-none">
              <HomePageVideoTile displayName={displayNameInput} />
            </div>

            <div className={clsx("hidden w-auto flex-col items-center justify-center gap-y-6 sm:flex")}>
              {inputs}
              <div className="space-y-1">
                {checkboxes.map(({ label, id, status, onChange }) => (
                  <Checkbox key={id} label={label} id={id} status={status} onChange={onChange} />
                ))}
              </div>
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
                className="w-full sm:w-auto"
              >
                Join the room
              </Button>
            </div>
          </>
        </div>
      </section>
    </HomePageLayout>
  );
};

export default VideoroomHomePage;
