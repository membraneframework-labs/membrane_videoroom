import clsx from "clsx";
import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import Button from "../../shared/components/Button";
import MembraneVideoroomLogo from "../../shared/components/MembraneVideoroomLogo";
import PlainLink from "../../shared/components/PlainLink";
import useToast from "../../shared/hooks/useToast";
import ShareSquare from "../icons/ShareSquare";
import Settings from "../icons/Settings";
import MediaControlButton from "../../../pages/room/components/MediaControlButton";
import { useModal } from "../../../contexts/ModalContext";
import useSmartphoneViewport from "../../shared/hooks/useSmartphoneViewport";

const Navbar: React.FC = () => {
  const match = useParams();
  const currentUrl = window.location.href;
  const roomId: string = match?.roomId || "";
  const { addToast } = useToast();
  const { setOpen } = useModal();

  const onLinkCopy = useCallback(async () => {
    await navigator.clipboard.writeText(currentUrl);
    addToast({ id: "toast-link-copied", message: "Link copied to clipboard" });
  }, [addToast, currentUrl]);

  const isSmartphone = useSmartphoneViewport().isSmartphone;

  return (
    <div className="flex w-full max-w-full flex-row justify-between gap-y-4">
      {!isSmartphone ? (
        <PlainLink href="/" name="home-page" className="self-start">
          <MembraneVideoroomLogo className="text-5xl" />
        </PlainLink>
      ) : (
        <h4 className="flex flex-row items-center font-rocGrotesk text-xl font-medium tracking-wide">{roomId}</h4>
      )}
      <div className={clsx("flex flex-row items-center gap-x-3 font-aktivGrotesk")}>
        {!isSmartphone && (
          <>
            <span>Invite link</span>
            <Button
              onClick={onLinkCopy}
              variant="light"
              className={clsx(
                "!rounded-3xl !border !border-brand-dark-blue-200 !px-5 !py-1",
                "flex items-center gap-x-2",
                "!text-base"
              )}
            >
              <span className="overflow-hidden text-ellipsis">{roomId}</span>
              <ShareSquare className="text-lg" />
            </Button>
          </>
        )}
        <MediaControlButton
          icon={Settings}
          hover="Settings"
          buttonClassName="!border !border-brand-dark-blue-200 "
          onClick={() => {
            setOpen(true);
          }}
          variant="light"
          position="bottom"
          hoverClassName="-ml-10"
        />
      </div>
    </div>
  );
};

export default Navbar;
