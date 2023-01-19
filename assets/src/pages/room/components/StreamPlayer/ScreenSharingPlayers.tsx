import React, { FC } from "react";
import MediaPlayerTile from "./MediaPlayerTile";
import { TrackWithId } from "./MediaPlayerPeersSection";
import PeerInfoLayer from "./PeerInfoLayer";

export type VideoStreamWithMetadata = {
  mediaPlayerId: string;
  peerId?: string;
  peerIcon?: string;
  peerName?: string;
  video: TrackWithId;
};

type Props = {
  streams: VideoStreamWithMetadata[];
};

const ScreenSharingPlayers: FC<Props> = ({ streams }: Props) => {
  return (
    //TODO remove max-h whan a new grid is introduced
    <div className="md:mb-none active-screensharing-grid mb-3 h-full max-h-[32rem] grid-cols-1 md:mr-3 md:grid-cols-1 2xl:max-h-[65rem]">
      {streams.map((config) => (
        <MediaPlayerTile
          key={config.mediaPlayerId}
          video={config.video}
          streamSource={"local"}
          layers={
            <PeerInfoLayer
              bottomLeft={
                <div>
                  ({config.peerIcon} {config.peerName}) Screen
                </div>
              }
            />
          }
        />
      ))}
    </div>
  );
};

export default ScreenSharingPlayers;
