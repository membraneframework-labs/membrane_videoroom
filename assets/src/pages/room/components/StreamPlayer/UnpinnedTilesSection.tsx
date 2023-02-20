import React, { FC, useMemo } from "react";
import MediaPlayerTile from "./MediaPlayerTile";
import { MembraneWebRTC, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import clsx from "clsx";
import { MediaPlayerTileConfig, OthersTileConfig, TileConfig, TrackWithId } from "../../../types";
import PeerInfoLayer from "./PeerInfoLayer";
import { getGridConfig, getUnpinnedTilesGridStyle } from "../../../../features/room-page/utils/getVideoGridConfig";
import NameTag from "../../../../features/room-page/components/NameTag";
import InitialsImage from "../../../../features/room-page/components/InitialsImage";
import { PinTileLayer } from "../../../../features/room-page/components/PinComponents";
import {
  DisabledMicIcon,
  isLoading,
  showDisabledIcon,
} from "../../../../features/room-page/components/DisabledTrackIcon";
import OthersTile from "./OthersTile";

type Props = {
  tileConfigs: TileConfig[];
  showSimulcast?: boolean;
  selectRemoteTrackEncoding?: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  oneColumn: boolean; // screensharing or pinned user
  webrtc?: MembraneWebRTC;
  pin: (tileId: string) => void;
  videoInVideo: boolean;
  blockPinning: boolean;
};
const UnpinnedTilesSection: FC<Props> = ({
  tileConfigs,
  showSimulcast,
  oneColumn,
  webrtc,
  pin,
  videoInVideo,
  blockPinning,
}: Props) => {
  const gridConfig = getGridConfig(tileConfigs.length);
  const videoGridStyle = useMemo(
    () => getUnpinnedTilesGridStyle(gridConfig, oneColumn, videoInVideo, tileConfigs.length === 1),
    [gridConfig, oneColumn, videoInVideo, tileConfigs.length]
  );

  const tileStyle = !oneColumn
    ? clsx(gridConfig.span, gridConfig.tileClass)
    : tileConfigs.length === 1
    ? "w-[400px] h-[220px]"
    : "";

  const tileSize = tileConfigs.length >= 7 ? "M" : "L";

  const mapMediaTileConfigToElement = (config: MediaPlayerTileConfig): JSX.Element => {
    const video: TrackWithId | null = config.video;
    const audio: TrackWithId | null = config.typeName === "remote" ? config.audio : null;
    const hasInitials = config.typeName === "local" || config.typeName === "remote";

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
              topLeft={
                hasInitials && showDisabledIcon(config.audio) ? (
                  <DisabledMicIcon isLoading={isLoading(audio)} />
                ) : undefined
              }
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
      />
    );
  };

  const mapOtherToElement = ({ initialsFront, initialsBack, noLeftUsers }: OthersTileConfig): JSX.Element => (
    <OthersTile
      key="others"
      initialsFront={initialsFront}
      initialsBack={initialsBack}
      numberOfLeftTiles={noLeftUsers}
    />
  );

  const mapTile = (config: TileConfig): JSX.Element =>
    config.typeName === "others" ? mapOtherToElement(config) : mapMediaTileConfigToElement(config);

  return (
    <div id="videos-grid" className={videoGridStyle}>
      {tileConfigs.map(mapTile)}
    </div>
  );
};

export default UnpinnedTilesSection;
