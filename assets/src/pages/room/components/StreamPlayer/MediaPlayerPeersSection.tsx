import React, { FC, useState } from "react";
import { ApiTrack, RemotePeer } from "../../hooks/usePeerState";
import MediaPlayerTile from "./MediaPlayerTile";
import { MembraneWebRTC, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import clsx from "clsx";
import { MediaPlayerTileConfig, StreamSource, TrackType, TrackWithId } from "../../../types";
import PeerInfoLayer from "./PeerInfoLayer";
import MicrophoneOff from "../../../../features/room-page/icons/MicrophoneOff";
import { getGridConfig } from "../../../../features/room-page/utils/getVideoGridConfig";
import NameTag from "../../../../features/room-page/components/NameTag";
import InitialsImage from "../../../../features/room-page/components/InitialsImage";
import { PinIndicator, PinTileButton } from "../../../../features/room-page/components/PinComponents";
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

const isLoading = (track: TrackWithId) => track?.stream === undefined && track?.metadata?.active === true;
const showDisabledIcon = (track: TrackWithId | null) => track?.stream === undefined || track?.metadata?.active === false;

type Props = {
  tileConfigs: MediaPlayerTileConfig[];
  showSimulcast?: boolean;
  selectRemoteTrackEncoding?: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  oneColumn: boolean; // screensharing or pinned user
  webrtc?: MembraneWebRTC;
  pinningApi: PinningApi;
};


const MediaPlayerPeersSection: FC<Props> = ({tileConfigs, showSimulcast, oneColumn, webrtc, pinningApi, }: Props) => {
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

  const {pinnedTileId, pin, unpin} : PinningApi = pinningApi;  

  return (
    <div id="videos-grid" className={clsx("h-full w-full", videoGridStyle)}>
      {tileConfigs.map((config) => {
        const video: TrackWithId | null = config.video;
        // const audio: TrackWithId | undefined = config.audio[0];   TODO add a default value or something idk

        const isPinned: boolean = config.mediaPlayerId === pinnedTileId;
        const onPinButtonClick: () => void = isPinned ? unpin : () => pin(config.mediaPlayerId);
        return (
          <MediaPlayerTile
            key={config.mediaPlayerId}
            peerId={config.peerId}
            video={video}
            // audioStream={audio?.stream}
            className={tileStyle}
            layers={
              <>
                {/* {showDisabledIcon(video) ? <InitialsImage initials={config.initials ?? "SCREEEEEEEEN"} /> : null} */}
                <PeerInfoLayer
                  bottomLeft={<NameTag name={config.displayName || "Unknown"} />}
                  // topLeft={showDisabledIcon(audio) ? <DisabledMicIcon isLoading={isLoading(audio)}/> : <></>}
                  topRight={isPinned ? <PinIndicator/> : <></>}
                  tileSize={tileSize}
                />
                <PinTileButton pinned={isPinned} onClick={onPinButtonClick}/>
              </>
            }
            showSimulcast={showSimulcast}
            streamSource={config.streamSource}
            // flipHorizontally={config.flipHorizontally}
            webrtc={webrtc}
            // playAudio={config.playAudio}
          />
        );
      })}
    </div>
  );
};

export default MediaPlayerPeersSection;
