import clsx from "clsx";
import React from "react";
import { useParams } from "react-router-dom";
import Button from "../../shared/components/Button";
import MembraneVideoroomLogo from "../../shared/components/MembraneVideoroomLogo";
import PlainLink from "../../shared/components/PlainLink";

//TODO make one, solid, expendable navbar
const Navbar: React.FC = () => {
  const match = useParams();
  const roomId: string = match?.roomId || "";

  return (
    <div className="flex w-full flex-row justify-between gap-y-4">
      <PlainLink href="/" name="home-page" className="self-start">
        <MembraneVideoroomLogo className="text-5xl" />
      </PlainLink>
      <div className="flex flex-row items-center gap-x-3 font-aktivGrotesk">
        <Button href={`/room/${roomId}`} name="rejoin-meeting" variant="light">
          Rejoin the meeting
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
