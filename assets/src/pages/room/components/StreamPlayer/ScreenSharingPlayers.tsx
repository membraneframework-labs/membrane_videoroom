import React, { FC } from "react";
import VideoPlayerOld from "./VideoPlayerOld";

export type VideoStreamWithMetadata = {
  peerId: string;
  videoId?: string;
  videoStream?: MediaStream;
};

type Props = {
  streams: VideoStreamWithMetadata[];
};

const ScreenSharingPlayers: FC<Props> = ({ streams }: Props) => {
  return (
    <div
      id="screensharings-grid"
      className="h-full mb-3 md:mr-3 md:mb-none active-screensharing-grid grid-cols-1 md:grid-cols-1"
    >
      {/*TODO change peerId etc. in bottomLeft, right etc.*/}
      {streams.map((e) => (
        <VideoPlayerOld
          key={e.peerId + ":" + e.videoId}
          videoStream={e.videoStream}
          bottomLeft={<div>{e.peerId}</div>}
        />
      ))}
    </div>
  );
};

export default ScreenSharingPlayers;
