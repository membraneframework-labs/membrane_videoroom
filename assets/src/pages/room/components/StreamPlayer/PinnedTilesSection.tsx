import React, { FC, ReactNode } from "react";
import { MediaPlayerTileConfig } from "../../../types";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import PeerInfoLayer from "./PeerInfoLayer";
import { PinIndicator, PinTileLayer } from "../../../../features/room-page/components/PinComponents";
import NameTag from "../../../../features/room-page/components/NameTag";
import RemoteMediaPlayerTile from "./RemoteMediaPlayerTile";
import { showDisabledIcon } from "../../../../features/room-page/components/DisabledTrackIcon";
import InitialsImage from "../../../../features/room-page/components/InitialsImage";
import { getGridConfig, GridConfigType } from "../../../../features/room-page/utils/getVideoGridConfig";
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
  showSimulcast: boolean;
  forceEncoding?: TrackEncoding;
};

const PinnedTilesSection: FC<Props> = ({ pinnedTiles, unpin, showSimulcast, forceEncoding }: Props) => {
  const gridConfig = getGridConfig(pinnedTiles.length);
  return (
    <PinnedTilesWrapper twoPinnedTiles={pinnedTiles.length === 2} gridConfig={gridConfig}>
      {pinnedTiles.map((tile: MediaPlayerTileConfig) => {
        const InfoLayer = () => (
          <PeerInfoLayer
            topRight={<PinIndicator />}
            topLeft={getTileUpperLeftIcon(tile)}
            bottomLeft={<NameTag name={tile.displayName} />}
          />
        );
        const PinLayer = () => <PinTileLayer pinned onClick={() => unpin(tile.mediaPlayerId)} />;

        if (tile.typeName === "screenShare") {
          return (
            <RemoteMediaPlayerTile
              key={tile.mediaPlayerId}
              className={clsx(gridConfig.span, gridConfig.tileClass)}
              peerId={tile.peerId}
              video={tile.video?.stream || null}
              layers={
                <>
                  <InfoLayer />
                  <PinLayer />
                </>
              }
              showSimulcast={false}
              forceEncoding={forceEncoding || null}
              encodingQuality={tile.video?.encodingQuality || null}
              remoteTrackId={tile.video?.remoteTrackId || null}
            />
          );
        }

        const Layers = () => (
          <>
            {showDisabledIcon(tile.video) && <InitialsImage initials={tile.initials} />}
            <InfoLayer />
            <PinLayer />
          </>
        );

        if (tile.typeName === "local") {
          return (
            <LocalMediaPlayerTile
              key={tile.mediaPlayerId}
              className={clsx(gridConfig.span, gridConfig.tileClass)}
              video={tile.video?.stream}
              flipHorizontally
              layers={<Layers />}
              showSimulcast={showSimulcast}
            />
          );
        }

        return (
          <RemoteMediaPlayerTile
            key={tile.mediaPlayerId}
            className={clsx(gridConfig.span, gridConfig.tileClass)}
            peerId={tile.peerId}
            video={tile.video?.stream}
            audio={tile?.audio?.stream}
            layers={<Layers />}
            showSimulcast={showSimulcast}
            forceEncoding={forceEncoding || null}
            encodingQuality={tile.video?.encodingQuality || null}
            remoteTrackId={tile.video?.remoteTrackId || null}
          />
        );
      })}
    </PinnedTilesWrapper>
  );
};

export default PinnedTilesSection;
