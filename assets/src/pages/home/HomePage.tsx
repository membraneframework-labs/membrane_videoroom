import React, { FC, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { useDeveloperInfo } from "../../contexts/DeveloperInfoContext";
import { Checkbox, Props as CheckboxProps } from "./Checkbox";
import { useToggle } from "../room/hooks/useToggle";
import { useMediaDeviceManager } from "../room/hooks/useMediaDeviceManager";
import {
  DEFAULT_AUTOSTART_CAMERA_AND_MICROPHONE_CHECKBOX_VALUE,
  DEFAULT_MANUAL_MODE_CHECKBOX_VALUE,
} from "../room/consts";
import { useUser } from "../../contexts/UserContext";

export const HomePage: FC = () => {
  const deviceManager = useMediaDeviceManager({ askOnMount: true });

  const match = useParams();
  const [searchParams] = useSearchParams();
  const { manualMode, simulcast, cameraAutostart } = useDeveloperInfo();
  const { setUsername } = useUser();

  const roomId: string = match?.roomId || "";
  const [roomIdInput, setRoomIdInput] = useState<string>(roomId);

  const lastDisplayName: string | null = localStorage.getItem("displayName");
  const [displayNameInput, setDisplayNameInput] = useState<string>(lastDisplayName || "");

  const [autostartCameraAndMicInput, setAutostartCameraAndMicCheckbox] = useToggle(
    DEFAULT_AUTOSTART_CAMERA_AND_MICROPHONE_CHECKBOX_VALUE
  );

  const simulcastParam: string = searchParams?.get("simulcast") || "true";
  const simulcastDefaultValue: boolean = simulcastParam === "true";
  const [simulcastInput, toggleSimulcastCheckbox] = useToggle(simulcastDefaultValue);

  const [manualModeInput, toggleManualModeCheckbox] = useToggle(DEFAULT_MANUAL_MODE_CHECKBOX_VALUE);

  const disabled = displayNameInput.length === 0 || roomIdInput.length === 0;

  const checkboxes: CheckboxProps[] = [
    {
      text: "Autostart camera and mic",
      id: "autostart-camera-and-mic",
      onChange: setAutostartCameraAndMicCheckbox,
      status: autostartCameraAndMicInput,
    },
    {
      text: "Simulcast",
      id: "simulcast",
      onChange: toggleSimulcastCheckbox,
      status: simulcastInput,
    },
    {
      text: "Manual mode",
      id: "manual-mode",
      onChange: toggleManualModeCheckbox,
      status: manualModeInput,
    },
  ];

  return (
    <section>
      {deviceManager.errorMessage && (
        <div className="w-full bg-red-700 p-1 text-white">{deviceManager.errorMessage}</div>
      )}
      <div className="flex flex-col items-center p-8">
        <div className="mb-4">
          <img src="/svg/logo.svg" className="mb-2" alt="logo" />
          <h2 className="mb-2 font-rocGrotesk text-4xl font-medium text-white ">Videoroom</h2>
        </div>
        <div className="mb-4 max-w-md rounded bg-white px-8 pt-6 pb-8 shadow-md">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="room_name">
              Room name
            </label>
            <input
              value={roomIdInput}
              onChange={(event) => setRoomIdInput(event.target.value)}
              type="text"
              required
              name="room_name"
              placeholder="Room name"
              className="focus:outline-none focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow"
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="display_name">
              Display name
            </label>
            <input
              value={displayNameInput}
              onChange={(event) => setDisplayNameInput(event.target.value)}
              className="focus:outline-none focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow"
              name="display_name"
              type="text"
              placeholder="Display name"
            />
          </div>
          {checkboxes.map(({ text, id, status, onChange }) => (
            <Checkbox key={id} text={text} id={id} status={status} onChange={onChange} />
          ))}
          <div className="flex items-center justify-between">
            <Link
              onClick={() => {
                localStorage.setItem("displayName", displayNameInput);
                setUsername(displayNameInput);
                simulcast.setSimulcast(simulcastInput);
                manualMode.setManualMode(manualModeInput);
                cameraAutostart.setCameraAutostart(autostartCameraAndMicInput);
              }}
              to={`/room/${roomIdInput}`}
              id="join"
              className={clsx(
                disabled ? "pointer-events-none cursor-default bg-gray-300" : "bg-membraneLight",
                "focus:outline-none focus:shadow-outline w-full rounded py-2 px-4 font-bold text-membraneDark ring-membraneDark hover:bg-membraneLight/75 focus:border-membraneDark focus:ring"
              )}
            >
              Join room!
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
