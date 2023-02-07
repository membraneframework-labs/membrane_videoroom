import React, { FC } from "react";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import clsx from "clsx";
import { PeerId } from "../../../../library/state.types";
import { createLocalPeerIdsSelector, createPeerIdsSelector } from "../../../../library/selectors";
import { useSelector } from "../../../../libraryUsage/setup";
import { RemoteMediaPlayerTileWrapper } from "./RemoteMediaPlayerTileWrapper";
import { LocalPeerMediaPlayerWrapper } from "./LocalPeerMediaPlayerWrapper";
import { getGridConfig } from "../../../../features/room-page/utils/getVideoGridConfig";

export type TrackWithId = {
  stream?: MediaStream;
  remoteTrackId: string | null;
  encodingQuality?: TrackEncoding;
  metadata?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  enabled?: boolean;
};

type Props = {
  oneColumn: boolean;
  showSimulcast: boolean;
};

const MediaPlayerPeersSection: FC<Props> = ({ oneColumn, showSimulcast }: Props) => {
  const localPeerId: PeerId | null = useSelector(createLocalPeerIdsSelector());
  const remotePeersIds: Array<PeerId> = useSelector(createPeerIdsSelector());

  const gridConfig = getGridConfig(remotePeersIds.length + 1);

  const getGridStyle = () => {
    const noPeers = !remotePeersIds.length;

    if (oneColumn) {
      if (noPeers) {
        // display video positioned absolute in another video
        return "absolute bottom-4 right-4 z-10 h-[220px] w-[400px]";
      } else {
        return "grid flex-1 grid-flow-row auto-rows-fr grid-cols-1 gap-y-3";
      }
    } else {
      return clsx(gridConfig.columns, gridConfig.grid, gridConfig.gap, gridConfig.padding, gridConfig.rows);
    }
  };

  const videoGridStyle = getGridStyle();

  return (
    <div id="videos-grid" className={clsx("h-full w-full", videoGridStyle)}>
      {localPeerId && (
        <LocalPeerMediaPlayerWrapper
          showSimulcast={showSimulcast}
          className={!oneColumn ? clsx(gridConfig.span, gridConfig.tileClass) : undefined}
        />
      )}
      {remotePeersIds.map((peerId) => (
        <RemoteMediaPlayerTileWrapper
          key={peerId}
          peerId={peerId}
          showSimulcast={showSimulcast}
          className={!oneColumn ? clsx(gridConfig.span, gridConfig.tileClass) : undefined}
        />
      ))}
    </div>
  );
};

export default MediaPlayerPeersSection;
