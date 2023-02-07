import React, { FC } from "react";
import { PeerId } from "../../../../library/state.types";
import { useSelector } from "../../../../libraryUsage/setup";
import { createUsersIdsWithScreenSharingSelector } from "../../../../libraryUsage/customSelectors";
import { ScreenSharingPlayer } from "./ScreenSharingPlayer";

const ScreenSharingPlayers: FC = () => {
  const peerIds: PeerId[] = useSelector(createUsersIdsWithScreenSharingSelector());

  return (
    <div className="active-screensharing-grid h-full grid-cols-1">
      {peerIds.map((id) => (
        <ScreenSharingPlayer key={id} peerId={id} />
      ))}
    </div>
  );
};

export default ScreenSharingPlayers;
