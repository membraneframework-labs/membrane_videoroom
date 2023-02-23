import React, { FC, ReactNode, useCallback } from "react";
import { MediaPlayerTileConfig, OthersTileConfig, TileConfig } from "../../../types";
import { MembraneWebRTC } from "@jellyfish-dev/membrane-webrtc-js";
import PeerInfoLayer from "./PeerInfoLayer";
import { PinIndicator, PinTileLayer } from "../../../../features/room-page/components/PinComponents";
import NameTag from "../../../../features/room-page/components/NameTag";
import MediaPlayerTile from "./MediaPlayerTile";
import {
  DisabledMicIcon,
  isLoading,
  showDisabledIcon,
} from "../../../../features/room-page/components/DisabledTrackIcon";
import InitialsImage from "../../../../features/room-page/components/InitialsImage";
import { GridConfigType, getGridConfig } from "../../../../features/room-page/utils/getVideoGridConfig";
import clsx from "clsx";
import OthersTile from "./OthersTile";

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

type CommonPinnedTileProps = {
  unpin: (tileIdToUnpin: string) => void;
  webrtc?: MembraneWebRTC;
  showSimulcast?: boolean;
};

type PinnedMediaTileProps = {
  pinnedTileConfig: MediaPlayerTileConfig;
  gridConfig: GridConfigType;
} & CommonPinnedTileProps;

const PinnedMediaTile = ({
  pinnedTileConfig,
  gridConfig,
  unpin,
  webrtc,
  showSimulcast,
}: PinnedMediaTileProps): JSX.Element => {
  const tileType = pinnedTileConfig.typeName;
  const hasInitials = tileType === "local" || tileType === "remote";
  return (
    <MediaPlayerTile
      key={pinnedTileConfig.mediaPlayerId}
      className={clsx(gridConfig.span, gridConfig.tileClass)}
      peerId={pinnedTileConfig.peerId}
      video={pinnedTileConfig.video}
      audio={tileType === "remote" ? pinnedTileConfig.audio : null}
      streamSource={pinnedTileConfig.streamSource}
      blockFillContent={tileType === "screenShare"}
      flipHorizontally={tileType === "local"}
      layers={
        <>
          {hasInitials && showDisabledIcon(pinnedTileConfig.video) && (
            <InitialsImage initials={pinnedTileConfig.initials} />
          )}
          <PeerInfoLayer
            topRight={<PinIndicator />}
            topLeft={
              hasInitials && showDisabledIcon(pinnedTileConfig.audio) ? (
                <DisabledMicIcon isLoading={isLoading(pinnedTileConfig.audio)} />
              ) : undefined
            }
            bottomLeft={<NameTag name={pinnedTileConfig.displayName} />}
          />
          <PinTileLayer pinned={true} onClick={() => unpin(pinnedTileConfig.mediaPlayerId)} />
        </>
      }
      showSimulcast={showSimulcast && tileType !== "screenShare"}
      webrtc={webrtc}
    />
  );
};

type Props = {
  pinnedTiles: TileConfig[];
} & CommonPinnedTileProps;

const PinnedTilesSection: FC<Props> = ({ pinnedTiles, unpin, webrtc, showSimulcast }: Props) => {
  const gridConfig = getGridConfig(pinnedTiles.length);

  const PinnedMediaTilePartial = useCallback(
    ({ config }: { config: MediaPlayerTileConfig }): JSX.Element => (
      <PinnedMediaTile
        pinnedTileConfig={config}
        gridConfig={gridConfig}
        unpin={unpin}
        webrtc={webrtc}
        showSimulcast={showSimulcast}
      />
    ),
    []
  );

  const OtherMediaTilePartial = useCallback(
    ({ config }: { config: OthersTileConfig }): JSX.Element => (
      <OthersTile
        key="others"
        initialsFront={config.initialsFront}
        initialsBack={config.initialsBack}
        numberOfLeftTiles={config.noLeftUsers}
      />
    ),
    []
  );

  return (
    <PinnedTilesWrapper twoPinnedTiles={pinnedTiles.length === 2} gridConfig={gridConfig}>
      {pinnedTiles.map((config: TileConfig) =>
        config.typeName !== "others" ? (
          <PinnedMediaTilePartial config={config} />
        ) : (
          <OtherMediaTilePartial config={config} />
        )
      )}
    </PinnedTilesWrapper>
  );
};

export default PinnedTilesSection;
