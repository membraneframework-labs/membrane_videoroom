import clsx from "clsx";
import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import Button from "../../shared/components/Button";
import MembraneVideoroomLogo from "../../shared/components/MembraneVideoroomLogo";
import PlainLink from "../../shared/components/PlainLink";
import useToast from "../../shared/hooks/useToast";
import ShareSquare from "../icons/ShareSquare";

const Navbar: React.FC = () => {
  const match = useParams();
  const currentUrl = window.location.href;
  const roomId: string = match?.roomId || "";
  const { addToast } = useToast();

  const onLinkCopy = useCallback(async () => {
    await navigator.clipboard.writeText(currentUrl);
    addToast({ id: "toast-link-copied", message: "Link copied to clipboard" });
  }, [addToast, currentUrl]);

  return (
    <div className="flex w-full flex-row justify-between gap-y-4">
      <PlainLink href="/" name="home-page" className="self-start">
        <MembraneVideoroomLogo className="text-5xl" />
      </PlainLink>
      <div className="flex flex-row items-center gap-x-3 font-aktivGrotesk">
        <span className="hidden sm:inline-block">Invite link</span>
        <Button
          onClick={onLinkCopy}
          variant="light"
          className={clsx(
            "!rounded-3xl !border !border-brand-dark-blue-200 !px-5 !py-1",
            "flex items-center gap-x-2",
            "!text-base"
          )}
        >
          {roomId} <ShareSquare className="text-lg" />
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
