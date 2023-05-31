import React from "react";
import { useParams } from "react-router-dom";
import Button from "../../shared/components/Button";
import MembraneVideoroomLogo from "../../shared/icons/MembraneVideoroomLogo";
import PlainLink from "../../shared/components/PlainLink";
import useSmartphoneViewport from "../../shared/hooks/useSmartphoneViewport";
import Logo from "../../shared/icons/Logo";
import clsx from "clsx";

//TODO make one, solid, expendable navbar
const Navbar: React.FC = () => {
  const match = useParams();
  const roomId: string = match?.roomId || "";

  const { isSmartphone } = useSmartphoneViewport();

  return (
    <div className="flex w-full flex-row justify-between gap-y-4">
      <PlainLink href="/" name="home-page" className="my-auto self-start">
        {isSmartphone ? <Logo /> : <MembraneVideoroomLogo className="text-5xl" />}
      </PlainLink>
      <div className="flex flex-row items-center gap-x-3 font-aktivGrotesk">
        <Button
          href={`/room/${roomId}`}
          name="rejoin-meeting"
          variant="light"
          className={clsx(isSmartphone && "!px-6 !py-2")}
        >
          Rejoin the meeting
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
