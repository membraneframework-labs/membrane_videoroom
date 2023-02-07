import React, { FC } from "react";
import MediaPlayerTile from "./MediaPlayerTile";
import PeerInfoLayer from "./PeerInfoLayer";
import NameTag from "../../../../features/room-page/components/NameTag";
import { PinningApi } from "../../../../features/room-page/utils/usePinning";
import { PinIndicator, PinTileButton } from "../../../../features/room-page/components/PinComponents";
import { MediaPlayerTileConfig } from "../../../types";

type Props = {
  streams: MediaPlayerTileConfig[];
  pinningApi: PinningApi;
};

// TODO change this component to PinnedTiles
const ScreenSharingPlayers: FC<Props> = ({ streams, pinningApi }: Props) => {
  const {pinnedTileId, pin, unpin} = pinningApi;
  return (
    <div className="active-screensharing-grid h-full grid-cols-1">
      {streams.map((config) => {
        const isPinned = config.mediaPlayerId === pinnedTileId;
        const onPinButtonClick = isPinned ? unpin : () => pin(config.mediaPlayerId);
        
        return <MediaPlayerTile
          blockFillContent
          key={config.mediaPlayerId}
          video={config.video}
          streamSource={"local"}
          layers={<>
            <PinTileButton pinned={isPinned} onClick={onPinButtonClick}/>
            <PeerInfoLayer 
              bottomLeft={<NameTag name={config.displayName}/>} 
              topRight={isPinned ? <PinIndicator/> : <></>}/>
            </>}/>})}
    </div>
  );
};

export default ScreenSharingPlayers;
