import React, { FC, useContext, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { UserContext } from "../../contexts/userContext";
import clsx from "clsx";
import { SimulcastContext } from "../../contexts/simulcastContext";

export const HomePage: FC = () => {
  const { setUsername } = useContext(UserContext);
  const { setSimulcast } = useContext(SimulcastContext);
  const lastDisplayName: string | null = localStorage.getItem("displayName");
  const [displayNameInput, setDisplayNameInput] = useState<string>(lastDisplayName || "");
  const [simulcastInput, setSimulcastInput] = useState<boolean>(true);
  const match = useParams();
  const roomId: string = match?.roomId || ""
  const [roomIdInput, setRoomIdInput] = useState<string>(roomId);

  const disabled = displayNameInput.length === 0 || roomIdInput.length === 0;

  return (
    <section>
      <div className="p-8 flex flex-col items-center">
        <div className="mb-4">
          <img src="/svg/logo.svg" className="mb-2" alt="logo" />
          <h2 className="font-rocGrotesk font-medium text-4xl text-white mb-2 ">Videoroom</h2>
        </div>
        <div className="bg-white shadow-md rounded max-w-md px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="room_name">
              Room name
            </label>
            <input
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              type="text"
              required
              name="room_name"
              placeholder="Room name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="display_name">
              Display name
            </label>
            <input
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="display_name"
              type="text"
              placeholder="Display name"
            />
          </div>
          <div className="form-check mb-6">
            <label className="form-check-label text-gray-700 text-sm font-bold" htmlFor="simulcast">
              Simulcast
            </label>
            <input
              onChange={() => setSimulcastInput((prevState) => !prevState)}
              className="form-check-input ml-1"
              type="checkbox"
              checked={simulcastInput}
              id="simulcast"
              name="simulcast"
            />
          </div>
          <div className="flex items-center justify-between">
            <Link
              onClick={() => {
                localStorage.setItem("displayName", displayNameInput);
                setUsername(displayNameInput);
                setSimulcast(simulcastInput);
              }}
              to={`/room/${roomIdInput}`}
              className={clsx(
                disabled ? "pointer-events-none cursor-default bg-gray-300" : "bg-membraneLight",
                "w-full hover:bg-membraneLight/75 focus:ring ring-membraneDark focus:border-membraneDark text-membraneDark font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
