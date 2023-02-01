import React, { FC } from "react";
import MediaPlayerTile from "./MediaPlayerTile";
import { TrackWithId } from "./MediaPlayerPeersSection";
import PeerInfoLayer from "./PeerInfoLayer";
import NameTag from "../../../../features/room-page/components/NameTag";
import { PinningApi } from "../../../../features/room-page/utils/usePinning";
import { PinIndicator, PinTileButton } from "../../../../features/room-page/components/PinComponents";

export type VideoStreamWithMetadata = {
  mediaPlayerId: string;
  peerId?: string;
  peerIcon?: string;
  peerName?: string;
  video: TrackWithId;
};

type Props = {
  streams: VideoStreamWithMetadata[];
  pinningApi: PinningApi;
};

const ScreenSharingPlayers: FC<Props> = ({ streams, pinningApi }: Props) => {
  const {pinnedTrackId, pin, unpin} = pinningApi;
  return (
    <div className="active-screensharing-grid h-full grid-cols-1">
      {streams.map((config) => {
        const isPinned = config.video.trackId === pinnedTrackId;
        const onPinButtonClick = isPinned ? unpin : () => pin(config.video.trackId);

        return <MediaPlayerTile
          blockFillContent
          key={config.mediaPlayerId}
          video={config.video}
          streamSource={"local"}
          layers={<>
            <PinTileButton pinned={isPinned} onClick={onPinButtonClick}/>
            <PeerInfoLayer 
              bottomLeft={<NameTag name={config.peerName || "Unknown"}/>} 
              topRight={isPinned ? <PinIndicator/> : <></>}/>
            </>}/>})}
    </div>
  );
};

export default ScreenSharingPlayers;
