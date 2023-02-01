import React, { FC } from "react";
import MediaPlayerTile from "./MediaPlayerTile";
import { TrackWithId } from "./MediaPlayerPeersSection";
import PeerInfoLayer from "./PeerInfoLayer";
import { useSelector2 } from "../../../../libraryUsage/setup";
import {
  createIsScreenSharingActiveSelector,
  createPeerGuiSelector,
  createPeersGuiSelector,
  createScreenSharingTracksSelector,
  createTracksRecordSelector,
  createUsersIdsWithScreenSharingSelector,
  PeerGui,
} from "../../../../libraryUsage/customSelectors";
import { LibraryTrackMinimal, PeerId } from "../../../../library/types";
import { useLog } from "../../../../helpers/UseLog";

export type VideoStreamWithMetadata = {
  mediaPlayerId: string;
  peerId?: string;
  peerIcon?: string;
  peerName?: string;
  video: TrackWithId;
};

type Props = {
  peerId: string;
};

const ScreenSharingPlayersWrapper = ({ peerId }: Props) => {
  const track: LibraryTrackMinimal | null = useSelector2(createScreenSharingTracksSelector(peerId));
  const peer: PeerGui | null = useSelector2(createPeerGuiSelector(peerId));

  useLog(track, "screenSharingTrack");

  return (
    <MediaPlayerTile
      audioStream={null}
      videoStream={track?.stream || null}
      playAudio={true}
      layers={
        <PeerInfoLayer
          bottomLeft={
            <div>
              ({peer?.emoji} {peer?.name}) Screen
            </div>
          }
        />
      }
    />
  );
};

const ScreenSharingPlayers: FC = () => {
  const peerIds: PeerId[] = useSelector2(createUsersIdsWithScreenSharingSelector());

  return (
    <div className="md:mb-none active-screensharing-grid mb-3 h-full grid-cols-1 md:mr-3 md:grid-cols-1">
      {peerIds.map((peerId) => (
        <ScreenSharingPlayersWrapper key={peerId} peerId={peerId} />
      ))}
    </div>
  );
};

export default ScreenSharingPlayers;
