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
    <div className="active-screensharing-grid h-full grid-cols-1">
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
