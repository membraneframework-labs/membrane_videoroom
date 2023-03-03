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

type Props = {
  tileConfigs: MediaPlayerTileConfig[];
  showSimulcast?: boolean;
  selectRemoteTrackEncoding?: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  oneRow: boolean; // screensharing or pinned user
  webrtc?: MembraneWebRTC;
  pin: (tileId: string) => void;
  videoInVideo: boolean;
  blockPinning: boolean;
  forceEncoding?: TrackEncoding;
};

const UnpinnedTilesSection: FC<Props> = ({
  tileConfigs,
  showSimulcast,
  oneRow,
  webrtc,
  pin,
  videoInVideo,
  blockPinning,
  forceEncoding,
}: Props) => {
  const gridConfig = getGridConfig(tileConfigs.length);
  const videoGridStyle = useMemo(
    () => getUnpinnedTilesGridStyle(gridConfig, oneRow, videoInVideo, tileConfigs.length === 1),
    [gridConfig, oneRow, videoInVideo, tileConfigs.length]
  );

  const tileStyle = !oneRow
    ? clsx(gridConfig.span, gridConfig.tileClass)
    : tileConfigs.length === 1
    ? "w-[400px] h-[220px]"
    : "sm:max-w-1/3";

  const tileSize = tileConfigs.length >= 7 ? "M" : "L";

  return (
    <div id="videos-grid" className={videoGridStyle}>
      {tileConfigs.map((config) => {
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
            forceEncoding={forceEncoding}
          />
        );
      })}
    </div>
  );
};

export default UnpinnedTilesSection;
