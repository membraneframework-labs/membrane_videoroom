import React, { FC, useMemo } from "react";
import RemoteMediaPlayerTile from "./RemoteMediaPlayerTile";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import clsx from "clsx";
import { MediaPlayerTileConfig, TrackWithId } from "../../../types";
import PeerInfoLayer from "./PeerInfoLayer";
import { getGridConfig, getUnpinnedTilesGridStyle } from "../../../../features/room-page/utils/getVideoGridConfig";
import NameTag from "../../../../features/room-page/components/NameTag";
import InitialsImage from "../../../../features/room-page/components/InitialsImage";
import { PinTileLayer } from "../../../../features/room-page/components/PinComponents";
import { showDisabledIcon } from "../../../../features/room-page/components/DisabledTrackIcon";
import useSmartphoneViewport from "../../../../features/shared/hooks/useSmartphoneViewport";
import { getTileUpperLeftIcon } from "../../../../features/room-page/utils/computeLeftUpperIcon";
import LocalMediaPlayerTile from "./LocalMediaPlayerTile";

type Props = {
  tileConfigs: MediaPlayerTileConfig[];
  showSimulcast: boolean;
  selectRemoteTrackEncoding?: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  isAnyTilePinned: boolean;
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

  return (
    <div id="videos-grid" className={videoGridStyle}>
      {tileConfigs.map((config: MediaPlayerTileConfig) => {
        const video: TrackWithId | null = config.video;
        const upperLeftIcon: JSX.Element | null = getTileUpperLeftIcon(config);

        const InfoLayer: FC = () => (
          <PeerInfoLayer
            bottomLeft={<NameTag name={config.displayName} />}
            topLeft={upperLeftIcon}
            tileSize={tileSize}
          />
        );
        const UnpinLayer: FC = () =>
          !blockPinning ? <PinTileLayer pinned={false} onClick={() => pin(config.mediaPlayerId)} /> : <></>;

        if (config.typeName === "screenShare") {
          return (
            <RemoteMediaPlayerTile
              key={config.mediaPlayerId}
              peerId={config.peerId}
              video={video?.stream}
              className={tileStyle}
              layers={
                <>
                  <InfoLayer />
                  <UnpinLayer />
                </>
              }
              showSimulcast={false}
              blockFillContent={true}
              forceEncoding={forceEncoding || null}
              encodingQuality={video?.encodingQuality || null}
              remoteTrackId={video?.remoteTrackId || null}
            />
          );
        }

        const hasInitials = config.typeName === "local" || config.typeName === "remote";

        const Layers: FC = () => (
          <>
            {hasInitials && showDisabledIcon(video) && <InitialsImage initials={config.initials} />}
            <InfoLayer />
            <UnpinLayer />
          </>
        );

        if (config.typeName === "local") {
          return (
            <LocalMediaPlayerTile
              key={config.mediaPlayerId}
              video={video?.stream}
              className={tileStyle}
              layers={<Layers />}
              showSimulcast={showSimulcast}
              flipHorizontally
            />
          );
        }

        return (
          <RemoteMediaPlayerTile
            key={config.mediaPlayerId}
            peerId={config.peerId}
            video={video?.stream}
            audio={config.audio?.stream}
            className={tileStyle}
            layers={<Layers />}
            showSimulcast={showSimulcast}
            forceEncoding={forceEncoding || null}
            encodingQuality={video?.encodingQuality || null}
            remoteTrackId={video?.remoteTrackId || null}
          />
        );
      })}
    </div>
  );
};

export default UnpinnedTilesSection;
