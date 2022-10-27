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
      {streams.map((e) => (
        <MediaPlayerTile
          key={e.peerId + ":" + e.video?.trackId}
          video={e.video}
          streamSource={"local"}
          bottomLeft={
            <div>
              ({e.peerIcon} {e.peerName}) Screen
            </div>
          }
        />
      ))}
    </div>
  );
};

export default ScreenSharingPlayers;
