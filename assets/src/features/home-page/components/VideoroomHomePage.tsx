import clsx from "clsx";
import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDeveloperInfo } from "../../../contexts/DeveloperInfoContext";
import { useUser } from "../../../contexts/UserContext";
import {
  DEFAULT_AUTOSTART_CAMERA_AND_MICROPHONE_CHECKBOX_VALUE,
  DEFAULT_MANUAL_MODE_CHECKBOX_VALUE,
} from "../../../pages/room/consts";
import { useMediaDeviceManager } from "../../../pages/room/hooks/useMediaDeviceManager";
import { useToggle } from "../../../pages/room/hooks/useToggle";
import Button from "../../shared/components/Button";
import { Checkbox, CheckboxProps } from "../../shared/components/Checkbox";
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

  // dev helpers
  const [searchParams] = useSearchParams();
  const deviceManager = useMediaDeviceManager({ askOnMount: true });
  const { manualMode, simulcast, cameraAutostart } = useDeveloperInfo();
  const [autostartCameraAndMicInput, setAutostartCameraAndMicCheckbox] = useToggle(
    DEFAULT_AUTOSTART_CAMERA_AND_MICROPHONE_CHECKBOX_VALUE
  );

  const simulcastParam: string = searchParams?.get("simulcast") || "true";
  const simulcastDefaultValue: boolean = simulcastParam === "true";
  const [simulcastInput, toggleSimulcastCheckbox] = useToggle(simulcastDefaultValue);

  const [manualModeInput, toggleManualModeCheckbox] = useToggle(DEFAULT_MANUAL_MODE_CHECKBOX_VALUE);

  const checkboxes: CheckboxProps[] = [
    {
      label: "Autostart camera and mic",
      id: "autostart-camera-and-mic",
      onChange: setAutostartCameraAndMicCheckbox,
      status: autostartCameraAndMicInput,
    },
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
      <section className="flex flex-col items-center gap-y-18">
        {deviceManager.errorMessage && (
          <div className="bg-red-700 text-white p-1 w-full">{deviceManager.errorMessage}</div>
        )}
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
          <div className="space-y-1">
            {checkboxes.map(({ label, id, status, onChange }) => (
              <Checkbox key={id} label={label} id={id} status={status} onChange={onChange} />
            ))}
          </div>
          <div className="flex items-center justify-center w-full">
            <Button
              onClick={() => {
                localStorage.setItem("displayName", displayNameInput);
                setUsername(displayNameInput);
                simulcast.setSimulcast(simulcastInput);
                manualMode.setManualMode(manualModeInput);
                cameraAutostart.setCameraAutostart(autostartCameraAndMicInput);
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
