import type { FC } from "react";
import React from "react";

import MediaPlayerPeersSection from "./components/StreamPlayer/MediaPlayerPeersSection";
import ScreenSharingPlayers from "./components/StreamPlayer/ScreenSharingPlayers";
import clsx from "clsx";
import { useSelector } from "../../libraryUsage/setup";
import { createIsScreenSharingActiveSelector } from "../../libraryUsage/customSelectors";
import { createPeerIdsSelector } from "../../library/selectors";
import type { PeerId } from "../../library/state.types";

type Props = {
  showSimulcast: boolean;
};

export const VideochatSection: FC<Props> = ({ showSimulcast }: Props) => {
  const isScreenSharingActive = useSelector(createIsScreenSharingActiveSelector());
  const peersIds: Array<PeerId> = useSelector(createPeerIdsSelector());
  const noPeers = !peersIds.length;

  return (
    <div id="videochat" className="grid-wrapper align-center flex h-full w-full justify-center">
      <div
        className={clsx(
          "grid h-full w-full auto-rows-fr gap-3 3xl:max-w-[1728px]",
          isScreenSharingActive && (noPeers ? "relative" : "sm:grid-cols-3/1")
        )}
      >
        {isScreenSharingActive && <ScreenSharingPlayers />}

        <MediaPlayerPeersSection showSimulcast={showSimulcast} oneColumn={isScreenSharingActive} />
      </div>
    </div>
  );
};
