import clsx from "clsx";
import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import Button from "../../shared/components/Button";
import MembraneVideoroomLogo from "../../shared/components/MembraneVideoroomLogo";
import PlainLink from "../../shared/components/PlainLink";
import ShareSquare from "../icons/ShareSquare";

const Navbar: React.FC = () => {
  const match = useParams();
  const currentUrl = window.location.href;
  const roomId: string = match?.roomId || "";

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(currentUrl);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-y-4 w-full justify-between">
      <PlainLink href="/" name="home-page" className="self-start">
        <MembraneVideoroomLogo className="text-5xl" />
      </PlainLink>
      <div className="flex gap-x-3 items-center">
        <span className="mt-1">Invite link</span>
        <Button
          onClick={copyLink}
          variant="light"
          className={clsx(
            "!px-5 !pt-1 !pb-0 !border !border-brand-dark-blue-200 !rounded-3xl",
            "flex items-center gap-x-2",
            "!text-base"
          )}
        >
          {roomId} <ShareSquare className="-mt-1" />
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
