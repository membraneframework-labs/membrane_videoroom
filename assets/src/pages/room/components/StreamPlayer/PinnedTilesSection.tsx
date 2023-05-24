import React, { FC, ReactNode } from "react";
import { MediaPlayerTileConfig } from "../../../types";
import { MembraneWebRTC, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import PeerInfoLayer from "./PeerInfoLayer";
import { PinIndicator, PinTileLayer } from "../../../../features/room-page/components/PinComponents";
import NameTag from "../../../../features/room-page/components/NameTag";
import RemoteMediaPlayerTile from "./RemoteMediaPlayerTile";
import { showDisabledIcon } from "../../../../features/room-page/components/DisabledTrackIcon";
import InitialsImage from "../../../../features/room-page/components/InitialsImage";
import { GridConfigType, getGridConfig } from "../../../../features/room-page/utils/getVideoGridConfig";
import clsx from "clsx";
import { getTileUpperLeftIcon } from "../../../../features/room-page/utils/computeLeftUpperIcon";
import LocalMediaPlayerTile from "./LocalMediaPlayerTile";

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
  // webrtc?: MembraneWebRTC;
  showSimulcast?: boolean;
  forceEncoding?: TrackEncoding;
};

const PinnedTilesSection: FC<Props> = ({ pinnedTiles, unpin, showSimulcast, forceEncoding }: Props) => {
  const gridConfig = getGridConfig(pinnedTiles.length);
  return (
    <PinnedTilesWrapper twoPinnedTiles={pinnedTiles.length === 2} gridConfig={gridConfig}>
      {pinnedTiles.map((pinnedTile: MediaPlayerTileConfig) => {
        const tileType = pinnedTile.typeName;
        const hasInitials = tileType === "local" || tileType === "remote";

        if (tileType === "screenShare") {
          return (
            <RemoteMediaPlayerTile
              key={pinnedTile.mediaPlayerId}
              className={clsx(gridConfig.span, gridConfig.tileClass)}
              peerId={pinnedTile.peerId}
              video={pinnedTile.video}
              audio={null}
              blockFillContent={true}
              flipHorizontally={false}
              layers={
                <>
                  <PeerInfoLayer
                    topRight={<PinIndicator />}
                    topLeft={getTileUpperLeftIcon(pinnedTile)}
                    bottomLeft={<NameTag name={pinnedTile.displayName} />}
                  />
                  <PinTileLayer pinned={true} onClick={() => unpin(pinnedTile.mediaPlayerId)} />
                </>
              }
              showSimulcast={false}
              forceEncoding={forceEncoding}
            />
          );
        }

        if (tileType === "local") {
          return (
            <LocalMediaPlayerTile
              key={pinnedTile.mediaPlayerId}
              className={clsx(gridConfig.span, gridConfig.tileClass)}
              peerId={pinnedTile.peerId}
              video={pinnedTile.video?.stream || null}
              audio={null}
              blockFillContent={false}
              flipHorizontally={tileType === "local"}
              layers={
                <>
                  {hasInitials && showDisabledIcon(pinnedTile.video) && (
                    <InitialsImage initials={pinnedTile.initials} />
                  )}
                  <PeerInfoLayer
                    topRight={<PinIndicator />}
                    topLeft={getTileUpperLeftIcon(pinnedTile)}
                    bottomLeft={<NameTag name={pinnedTile.displayName} />}
                  />
                  <PinTileLayer pinned={true} onClick={() => unpin(pinnedTile.mediaPlayerId)} />
                </>
              }
              showSimulcast={showSimulcast}
            />
          );
        }

        return (
          <RemoteMediaPlayerTile
            key={pinnedTile.mediaPlayerId}
            className={clsx(gridConfig.span, gridConfig.tileClass)}
            peerId={pinnedTile.peerId}
            video={pinnedTile.video}
            audio={tileType === "remote" ? pinnedTile.audio : null}
            blockFillContent={false}
            flipHorizontally={false}
            layers={
              <>
                {hasInitials && showDisabledIcon(pinnedTile.video) && <InitialsImage initials={pinnedTile.initials} />}
                <PeerInfoLayer
                  topRight={<PinIndicator />}
                  topLeft={getTileUpperLeftIcon(pinnedTile)}
                  bottomLeft={<NameTag name={pinnedTile.displayName} />}
                />
                <PinTileLayer pinned={true} onClick={() => unpin(pinnedTile.mediaPlayerId)} />
              </>
            }
            showSimulcast={showSimulcast}
            forceEncoding={forceEncoding}
          />
        );
      })}
    </PinnedTilesWrapper>
  );
};

export default PinnedTilesSection;
