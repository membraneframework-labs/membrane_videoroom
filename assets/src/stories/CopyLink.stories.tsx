import clsx from "clsx";
import React, { useCallback } from "react";
import ShareSquare from "../features/room-page/icons/ShareSquare";
import Button from "../features/shared/components/Button";

export default {
  title: "components/room-page/CopyLink",
};

export const Normal = () => {
  const roomId = "asd-fgh";
  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(`https://videoroom.membrane.stream/room/${roomId}`);
  }, []);
  return (
    <div className="flex flex-row items-center gap-x-3 font-aktivGrotesk">
      <span className="hidden sm:inline-block">Invite link</span>
      <Button
        onClick={copyLink}
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
  );
};
