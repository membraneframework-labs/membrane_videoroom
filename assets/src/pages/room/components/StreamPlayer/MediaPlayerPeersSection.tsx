import type { FC } from "react";
import React from "react";
import type { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import clsx from "clsx";
import type { PeerId } from "membrane-react-webrtc-client";
import { createLocalPeerIdsSelector, createPeerIdsSelector } from "membrane-react-webrtc-client";
import { useSelector } from "../../../../libraryUsage/setup";
import { RemoteMediaPlayerTileWrapper } from "./RemoteMediaPlayerTileWrapper";
import { LocalPeerMediaPlayerWrapper } from "./LocalPeerMediaPlayerWrapper";
import type { GridConfigType } from "../../../../features/room-page/utils/getVideoGridConfig";
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

const getGridStyle = (noPeers: boolean, manyColumn: boolean, gridConfig: GridConfigType) => {
  if (manyColumn) return clsx(gridConfig.columns, gridConfig.grid, gridConfig.gap, gridConfig.padding, gridConfig.rows);
  return noPeers
    ? "absolute bottom-4 right-4 z-10 h-[220px] w-[400px]"
    : "grid flex-1 grid-flow-row auto-rows-fr grid-cols-1 gap-y-3";
};

const MediaPlayerPeersSection: FC<Props> = ({ oneColumn, showSimulcast }: Props) => {
  const localPeerId: PeerId | null = useSelector(createLocalPeerIdsSelector());
  const remotePeersIds: Array<PeerId> = useSelector(createPeerIdsSelector());

  const gridConfig: GridConfigType = getGridConfig(remotePeersIds.length + 1);
  const videoGridStyle = getGridStyle(!remotePeersIds.length, !oneColumn, gridConfig);
  const tileSize = remotePeersIds.length >= 7 ? "M" : "L";

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
          tileSize={tileSize}
        />
      ))}
    </div>
  );
};

export default MediaPlayerPeersSection;
