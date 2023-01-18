import clsx from "clsx";
import React from "react";
import { useParams } from "react-router-dom";
import Button from "../../shared/components/Button";
import MembraneVideoroomLogo from "../../shared/components/MembraneVideoroomLogo";
import PlainLink from "../../shared/components/PlainLink";
import ShareSquare from "../icons/ShareSquare";

const Navbar: React.FC = () => {
  const match = useParams();
  const currentUrl = window.location.href;
  const roomId: string = match?.roomId || "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(currentUrl);
  };

  return (
    <div className="flex w-full flex-col justify-between gap-y-4 sm:flex-row">
      <PlainLink href="/" name="home-page" className="self-start">
        <MembraneVideoroomLogo className="text-5xl" />
      </PlainLink>
      <div className="flex items-center gap-x-3">
        <span className="mt-1">Invite link</span>
        <Button
          onClick={copyLink}
          className={clsx(
            "rounded-3xl border border-brand-dark-blue-200 px-5 pt-1",
            "flex items-center gap-x-2",
            "btn-light font-medium"
          )}
        >
          {roomId} <ShareSquare className="-mt-1" />
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
