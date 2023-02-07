import React, { FC, useMemo } from "react";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import clsx from "clsx";
import { LibraryPeersState, PeerId } from "../../../../library/state.types";
import {
  createLocalPeerIdsSelector,
  createPeerIdsSelector,
  useCreateLocalPeerIdsSelector
} from "../../../../library/selectors";
import { useSelector } from "../../../../libraryUsage/setup";
import { RemoteMediaPlayerTileWrapper } from "./RemoteMediaPlayerTileWrapper";
import { LocalPeerMediaPlayerWrapper } from "./LocalPeerMediaPlayerWrapper";
import { getGridConfig, GridConfigType } from "../../../../features/room-page/utils/getVideoGridConfig";
import { PeerMetadata } from "../../hooks/usePeerState";
import { TrackMetadata } from "../../../../libraryUsage/types";

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
  // const memo: (snapshot: LibraryPeersState<PeerMetadata, TrackMetadata> | null) => string | null = useMemo(() => {
  //   console.log("%c memo!", "color: blue")
  //   return createLocalPeerIdsSelector();
  // }, []);

  const memo = useCreateLocalPeerIdsSelector<PeerMetadata, TrackMetadata>()

  const localPeerId: PeerId | null = useSelector(memo);
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
