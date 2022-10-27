import React, { FC } from "react";
import VideoPlayerTile from "./VideoPlayerTile";

export type VideoStreamWithMetadata = {
  peerId: string;
  peerIcon?: string;
  peerName?: string;
  videoId?: string;
  videoStream?: MediaStream;
};

type Props = {
  streams: VideoStreamWithMetadata[];
};

const ScreenSharingPlayers: FC<Props> = ({ streams }: Props) => {
  return (
    <div className="h-full mb-3 md:mr-3 md:mb-none active-screensharing-grid grid-cols-1 md:grid-cols-1">
      {streams.map((e) => (
        <VideoPlayerTile
          key={e.peerId + ":" + e.videoId}
          videoStream={e.videoStream}
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
