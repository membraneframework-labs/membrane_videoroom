import React, { FC, useMemo } from "react";
import MediaPlayerTile from "./MediaPlayerTile";
import { WebRTCEndpoint, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import clsx from "clsx";
import { MediaPlayerTileConfig, TrackWithId, isPeerTileConfig } from "../../../types";
import PeerInfoLayer from "./PeerInfoLayer";
import { getGridConfig, getUnpinnedTilesGridStyle } from "../../../../features/room-page/utils/getVideoGridConfig";
import NameTag from "../../../../features/room-page/components/NameTag";
import InitialsImage from "../../../../features/room-page/components/InitialsImage";
import { PinTileLayer } from "../../../../features/room-page/components/PinComponents";
import { showDisabledIcon } from "../../../../features/room-page/components/DisabledTrackIcon";
import useSmartphoneViewport from "../../../../features/shared/hooks/useSmartphoneViewport";
import { getTileUpperLeftIcon } from "../../../../features/room-page/utils/computeLeftUpperIcon";
import { useSortedUnpinnedTiles } from "../../hooks/useSortedUnpinnedTiles";

type Props = {
  tileConfigs: MediaPlayerTileConfig[];
  showSimulcast?: boolean;
  selectRemoteTrackEncoding?: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  isAnyTilePinned: boolean;
  webrtc?: WebRTCEndpoint;
  pin: (tileId: string) => void;
  videoInVideo: boolean;
  blockPinning: boolean;
  forceEncoding?: TrackEncoding;
  horizontal: boolean;
};

const UnpinnedTilesSection: FC<Props> = ({
  tileConfigs,
  showSimulcast,
  isAnyTilePinned,
  webrtc,
  pin,
  videoInVideo,
  blockPinning,
  forceEncoding,
  horizontal,
}: Props) => {
  const gridConfig = getGridConfig(tileConfigs.length);
  const isSmartphone = useSmartphoneViewport().isSmartphone || false;
  const videoGridStyle = useMemo(
    () =>
      getUnpinnedTilesGridStyle(
        gridConfig,
        isAnyTilePinned,
        horizontal,
        videoInVideo,
        tileConfigs.length === 1,
        isSmartphone
      ),
    [gridConfig, isAnyTilePinned, horizontal, videoInVideo, tileConfigs.length, isSmartphone]
  );

  const tileStyle = !isAnyTilePinned
    ? clsx(gridConfig.span, gridConfig.tileClass)
    : tileConfigs.length === 1
    ? "w-[400px] h-[220px]"
    : horizontal
    ? "sm:max-w-1/3"
    : "";

  const tileSize = tileConfigs.length >= 7 ? "M" : "L";
  const maxTiles = isSmartphone ? 8 : isAnyTilePinned ? 5 : 16;
  const { visibleTiles, overflownTiles } = useSortedUnpinnedTiles(maxTiles, tileConfigs);
  const overflownTilesInitials = overflownTiles
    .filter(isPeerTileConfig)
    .map(({ mediaPlayerId, initials }) => ({ mediaPlayerId, initials }));

  return (
    <div id="videos-grid" className={videoGridStyle}>
      {visibleTiles.map((config: MediaPlayerTileConfig) => {
        const video: TrackWithId | null = config.video;
        const hasInitials = config.typeName === "local" || config.typeName === "remote";
        const upperLeftIcon: JSX.Element | null = getTileUpperLeftIcon(config);

        return (
          <MediaPlayerTile
            key={config.mediaPlayerId}
            peerId={config.peerId}
            video={video}
            audio={config.typeName === "remote" ? config.audio : null}
            className={tileStyle}
            layers={
              <>
                {hasInitials && showDisabledIcon(video) && <InitialsImage initials={config.initials} />}
                <PeerInfoLayer
                  bottomLeft={<NameTag name={config.displayName} />}
                  topLeft={upperLeftIcon}
                  tileSize={tileSize}
                />
                {!blockPinning ? <PinTileLayer pinned={false} onClick={() => pin(config.mediaPlayerId)} /> : undefined}
              </>
            }
            showSimulcast={showSimulcast && config.typeName !== "screenShare"}
            streamSource={config.streamSource}
            flipHorizontally={config.typeName === "local"}
            webrtc={webrtc}
            blockFillContent={config.typeName === "screenShare"}
            forceEncoding={forceEncoding}
          />
        );
      })}
      {overflownTiles.length > 0 && (
        <div
          className={clsx(
            tileStyle,
            "relative h-full w-full justify-center overflow-hidden",
            "grid place-content-center rounded-xl border border-brand-dark-blue-300 bg-brand-dark-blue-200"
          )}
        >
          <div className="flex flex-col gap-2">
            <div className="flex -space-x-4">
              {overflownTilesInitials.map((tile) => (
                <div
                  key={tile.mediaPlayerId}
                  className="grid h-14 w-14 place-content-center rounded-full border-2 border-brand-dark-blue-200 bg-brand-dark-blue-100"
                >
                  <span className="font-roc-grotesk text-lg font-medium text-brand-dark-blue-400">{tile.initials}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-center text-xs">+ {overflownTiles.length} others</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnpinnedTilesSection;
