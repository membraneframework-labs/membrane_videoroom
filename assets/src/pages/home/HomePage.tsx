import React, { FC, useState } from "react";
import { Link } from "react-router-dom";

export const HomePage: FC = () => {
  const lastDisplayName = localStorage.getItem("displayName") || undefined;
  const [displayName, setDisplayName] = useState<string | undefined>(lastDisplayName);
  const [roomId, setRoomId] = useState<string | undefined>("123");

  return (
    <div className="p-8 flex flex-col items-center">
      <div className="mb-4">
        <img src="/svg/logo.svg" className="mb-2" />
        <h2 className="font-rocGrotesk font-medium text-4xl text-white mb-2 ">Videoroom</h2>
      </div>
      <form id="form" method="post" className="bg-white shadow-md rounded max-w-md px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="room_name">
            Room name
          </label>
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
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
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
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
          <input className="form-check-input" type="checkbox" value="true" id="simulcast" name="simulcast" />
        </div>
        <div className="flex items-center justify-between">
          <Link
            to={`room/${roomId}`}
            className="w-full bg-membraneLight hover:bg-membraneLight/75 focus:ring ring-membraneDark focus:border-membraneDark text-membraneDark font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Join room!
          </Link>
        </div>
      </form>
    </div>
  );
};
