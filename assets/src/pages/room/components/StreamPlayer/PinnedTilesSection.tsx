import React, { FC, ReactNode } from "react";
import { MediaPlayerTileConfig } from "../../../types";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { PinTileLayer } from "../../../../features/room-page/components/PinComponents";
import { getGridConfig, GridConfigType } from "../../../../features/room-page/utils/getVideoGridConfig";
import clsx from "clsx";
import Tile from "./Tile";

type WrapperProps = {
  children: ReactNode;
  twoPinnedTiles: boolean;
  gridConfig: GridConfigType;
};

const PinnedTilesWrapper: FC<WrapperProps> = ({ children, twoPinnedTiles, gridConfig }: WrapperProps) => {
  const columnWrapper = <div className="active-screensharing-grid h-full grid-cols-1">{children}</div>;
  const activeGridWrapper = (
    <div className="grid h-full w-full auto-rows-fr gap-3">
      <div className={clsx(gridConfig.columns, gridConfig.grid, gridConfig.gap, gridConfig.padding, gridConfig.rows)}>
        {children}
      </div>
    </div>
  );
  return twoPinnedTiles ? columnWrapper : activeGridWrapper;
};

type Props = {
  pinnedTiles: MediaPlayerTileConfig[];
  unpin: (tileIdToUnpin: string) => void;
  showSimulcast: boolean;
  forceEncoding?: TrackEncoding;
};

const PinnedTilesSection: FC<Props> = ({ pinnedTiles, unpin, showSimulcast, forceEncoding }: Props) => {
  const gridConfig = getGridConfig(pinnedTiles.length);
  const className = clsx(gridConfig.span, gridConfig.tileClass);
  return (
    <PinnedTilesWrapper twoPinnedTiles={pinnedTiles.length === 2} gridConfig={gridConfig}>
      {pinnedTiles.map((tile) => (
        <Tile
          key={tile.mediaPlayerId} // todo rename mediaPlayerId to tileId
          tile={tile}
          className={className}
          forceEncoding={forceEncoding}
          showSimulcast={showSimulcast}
          pinLayer={<PinTileLayer pinned onClick={() => unpin(tile.mediaPlayerId)} />}
        />
      ))}
    </PinnedTilesWrapper>
  );
};

export default PinnedTilesSection;
