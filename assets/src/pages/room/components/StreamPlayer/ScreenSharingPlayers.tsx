import React, { FC } from "react";
import MediaPlayerTile from "./MediaPlayerTile";
import { TrackWithId } from "./MediaPlayerPeersSection";
import PeerInfoLayer from "./PeerInfoLayer";
import NameTag from "../../../../features/room-page/components/NameTag";

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
          screenShare
          key={config.mediaPlayerId}
          video={config.video}
          streamSource={"local"}
          cameraOffImage={null}
          layers={<PeerInfoLayer bottomLeft={<NameTag name={config.peerName || "Unknown"} />} />}
        />
      ))}
    </div>
  );
};

export default ScreenSharingPlayers;
