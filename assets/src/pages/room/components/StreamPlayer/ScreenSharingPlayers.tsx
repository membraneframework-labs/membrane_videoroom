import React, { FC } from "react";
import MediaPlayerTile from "./MediaPlayerTile";
import { TrackWithId } from "./MediaPlayerPeersSection";
import PeerInfoLayer from "./PeerInfoLayer";
import NameTag from "../../../../features/room-page/components/NameTag";
import { useSelector } from "../../../../libraryUsage/setup";
import {
  createIsScreenSharingActiveSelector,
  createPeerGuiSelector,
  createPeersGuiSelector,
  createScreenSharingTracksSelector,
  createTracksRecordSelector,
  createUsersIdsWithScreenSharingSelector,
  PeerGui,
} from "../../../../libraryUsage/customSelectors";
import { LibraryTrackMinimal, PeerId } from "../../../../library/state.types";
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
  const track: LibraryTrackMinimal | null = useSelector(createScreenSharingTracksSelector(peerId));
  const peer: PeerGui | null = useSelector(createPeerGuiSelector(peerId));

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
  const peerIds: PeerId[] = useSelector(createUsersIdsWithScreenSharingSelector());

  return (
    <div className="active-screensharing-grid h-full grid-cols-1">
      {peerIds.map((peerId) => (
        <ScreenSharingPlayersWrapper key={peerId} peerId={peerId} />
      ))}
    </div>
  );
};

export default ScreenSharingPlayers;
