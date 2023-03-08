import React, { FC, useMemo } from "react";
import MediaPlayerTile from "./MediaPlayerTile";
import { MembraneWebRTC, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import clsx from "clsx";
import { MediaPlayerTileConfig, TrackWithId } from "../../../types";
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
import SoundIcon from "../../../../features/room-page/components/SoundIcon";

type Props = {
  tileConfigs: MediaPlayerTileConfig[];
  showSimulcast?: boolean;
  selectRemoteTrackEncoding?: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  isAnyTilePinned: boolean;
  webrtc?: MembraneWebRTC;
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
  const videoGridStyle = useMemo(
    () => getUnpinnedTilesGridStyle(gridConfig, isAnyTilePinned, horizontal, videoInVideo, tileConfigs.length === 1),
    [gridConfig, isAnyTilePinned, horizontal, videoInVideo, tileConfigs.length]
  );

  const tileStyle = !isAnyTilePinned
    ? clsx(gridConfig.span, gridConfig.tileClass)
    : tileConfigs.length === 1
    ? "w-[400px] h-[220px]"
    : horizontal
    ? "sm:max-w-1/3"
    : "";

  const tileSize = tileConfigs.length >= 7 ? "M" : "L";

  const getUpperLeftIcon = (config: MediaPlayerTileConfig): JSX.Element | null => {
    if (config.typeName !== "local" && config.typeName !== "remote") return null;

    if (showDisabledIcon(config.audio)) return <DisabledMicIcon isLoading={isLoading(config.audio)} />;
    if (config.isSpeaking) return <SoundIcon />;

    return null;
  };

  return (
    <div id="videos-grid" className={videoGridStyle}>
      {tileConfigs.map((config: MediaPlayerTileConfig) => {
        const video: TrackWithId | null = config.video;
        const hasInitials = config.typeName === "local" || config.typeName === "remote";
        const upperLeftIcon: JSX.Element | null = getUpperLeftIcon(config);

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
    </div>
  );
};

export default UnpinnedTilesSection;
