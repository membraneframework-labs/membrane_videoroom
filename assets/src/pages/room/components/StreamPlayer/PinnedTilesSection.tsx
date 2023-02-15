import React, { FC, ReactNode } from "react";
import { MediaPlayerTileConfig } from "../../../types";
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
  webrtc?: MembraneWebRTC;
  showSimulcast?: boolean;
};

const PinnedTilesSection: FC<Props> = ({ pinnedTiles, unpin, webrtc, showSimulcast }: Props) => {
  const gridConfig = getGridConfig(pinnedTiles.length);

  const mappedScreenShareTiles = pinnedTiles.map((pinnedTile: MediaPlayerTileConfig) => {
    const tileType = pinnedTile.typeName;
    const hasInitials = tileType === "local" || tileType === "remote";
    return (
      <MediaPlayerTile
        key={pinnedTile.mediaPlayerId}
        className={clsx(gridConfig.span, gridConfig.tileClass)}
        peerId={pinnedTile.peerId}
        video={pinnedTile.video}
        audio={tileType === "remote" ? pinnedTile.audio : null}
        streamSource={pinnedTile.streamSource}
        blockFillContent={tileType === "screenShare"}
        flipHorizontally={tileType === "local"}
        layers={
          <>
            {hasInitials && showDisabledIcon(pinnedTile.video) && <InitialsImage initials={pinnedTile.initials} />}
            <PeerInfoLayer
              topRight={<PinIndicator />}
              topLeft={
                hasInitials && showDisabledIcon(pinnedTile.audio) ? (
                  <DisabledMicIcon isLoading={isLoading(pinnedTile.audio)} />
                ) : null
              }
              bottomLeft={<NameTag name={pinnedTile.displayName} />}
            />
            <PinTileLayer pinned={true} onClick={() => unpin(pinnedTile.mediaPlayerId)} />
          </>
        }
        showSimulcast={showSimulcast}
        webrtc={webrtc}
      />
    );
  });

  return (
    <PinnedTilesWrapper twoPinnedTiles={pinnedTiles.length === 2} gridConfig={gridConfig}>
      {mappedScreenShareTiles}
    </PinnedTilesWrapper>
  );
};

export default PinnedTilesSection;
