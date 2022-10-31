import React, { FC } from "react";
import MediaPlayerTile from "./MediaPlayerTile";
import { TrackWithId } from "./MediaPlayerPeersSection";

export type VideoStreamWithMetadata = {
  peerId: string;
  peerIcon?: string;
  peerName?: string;
  video: TrackWithId;
};

type Props = {
  streams: VideoStreamWithMetadata[];
};

const ScreenSharingPlayers: FC<Props> = ({ streams }: Props) => {
  return (
    <div className="h-full mb-3 md:mr-3 md:mb-none active-screensharing-grid grid-cols-1 md:grid-cols-1">
      {streams.map((config) => (
        <MediaPlayerTile
          key={config.video.trackId}
          video={config.video}
          streamSource={"local"}
          bottomLeft={
            <div>
              ({config.peerIcon} {config.peerName}) Screen
            </div>
          }
        />
      ))}
    </div>
  );
};

export default ScreenSharingPlayers;
