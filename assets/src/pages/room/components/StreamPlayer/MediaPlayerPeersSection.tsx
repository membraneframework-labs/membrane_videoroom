import React, { FC } from "react";
import MediaPlayerTile from "./MediaPlayerTile";
import { MembraneWebRTC, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import clsx from "clsx";
import { MediaPlayerTileConfig, TrackWithId } from "../../../types";
import PeerInfoLayer from "./PeerInfoLayer";
import MicrophoneOff from "../../../../features/room-page/icons/MicrophoneOff";
import { getGridConfig } from "../../../../features/room-page/utils/getVideoGridConfig";
import NameTag from "../../../../features/room-page/components/NameTag";
import InitialsImage from "../../../../features/room-page/components/InitialsImage";
import { PinTileButton } from "../../../../features/room-page/components/PinComponents";
import { PinningApi } from "../../../../features/room-page/utils/usePinning";

type DisabledMicIconProps = {
  isLoading: boolean;
};

const DisabledMicIcon = ({ isLoading }: DisabledMicIconProps) => {
  return (
    <div className="flex h-8 w-8 flex-wrap content-center justify-center rounded-full bg-white">
      <MicrophoneOff className={isLoading ? "animate-spin" : ""} fill="#001A72" />
    </div>
  );
};

const isLoading = (track: TrackWithId | null) => track !== null && track?.stream === undefined && track?.metadata?.active === true;
const showDisabledIcon = (track: TrackWithId | null) => track !== null && track?.stream === undefined || track?.metadata?.active === false;

type Props = {
  tileConfigs: MediaPlayerTileConfig[];
  showSimulcast?: boolean;
  selectRemoteTrackEncoding?: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  oneColumn: boolean; // screensharing or pinned user
  webrtc?: MembraneWebRTC;
  pinningApi: PinningApi;
  blockPinning: boolean;
};


const MediaPlayerPeersSection: FC<Props> = ({tileConfigs, showSimulcast, oneColumn, webrtc, pinningApi, blockPinning}: Props) => {
  const gridConfig = getGridConfig(tileConfigs.length);
  const getGridStyle = () => {
    if (oneColumn) {
      const videoInVideo = tileConfigs.length === 1;
      if (videoInVideo) {
        return "absolute bottom-4 right-4 z-10 h-[220px] w-[400px]";
      } else {
        return "grid flex-1 grid-flow-row auto-rows-fr grid-cols-1 gap-y-3";
      }
    } else {
      return clsx(gridConfig.columns, gridConfig.grid, gridConfig.gap, gridConfig.padding, gridConfig.rows);
    }
  };

  const videoGridStyle = getGridStyle();
  const tileStyle = !oneColumn ? clsx(gridConfig.span, gridConfig.tileClass) : "";
  const tileSize = tileConfigs.length >= 7 ? "M" : "L";

  return (
    <div id="videos-grid" className={clsx("h-full w-full", videoGridStyle)}>
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
                { (hasInitials && showDisabledIcon(video)) ? <InitialsImage initials={config.initials} /> : null}
                <PeerInfoLayer
                  bottomLeft={<NameTag name={config.displayName} />}
                  topLeft={(hasInitials && showDisabledIcon(config.audio) )? <DisabledMicIcon isLoading={isLoading(audio)}/> : <></>}
                  tileSize={tileSize}
                  />
                {!blockPinning ? <PinTileButton pinned={false} onClick={() => pinningApi.pin(config.mediaPlayerId)}/> : <></>}
              </>
            }
            showSimulcast={showSimulcast}
            streamSource={config.streamSource}
            flipHorizontally={config.typeName === "local"}
            webrtc={webrtc}
            blockFillContent={config.typeName === "screenShare"}
            />
        );
      })}
    </div>
  );
};

export default MediaPlayerPeersSection;
