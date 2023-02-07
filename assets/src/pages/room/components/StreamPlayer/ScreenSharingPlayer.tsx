import { LibraryTrackMinimal, PeerId } from "../../../../library/state.types";
import React, { FC } from "react";
import { useSelector } from "../../../../libraryUsage/setup";
import {
  createPeerGuiSelector,
  createScreenSharingTracksSelector,
  PeerGui,
} from "../../../../libraryUsage/customSelectors";
import MediaPlayerTile from "./MediaPlayerTile";
import PeerInfoLayer from "./PeerInfoLayer";
import NameTag from "../../../../features/room-page/components/NameTag";

export type Props = {
  peerId: PeerId;
};

export const ScreenSharingPlayer: FC<Props> = ({ peerId }: Props) => {
  const track: LibraryTrackMinimal | null = useSelector(createScreenSharingTracksSelector(peerId));
  const peer: PeerGui | null = useSelector(createPeerGuiSelector(peerId));

  return (
    <MediaPlayerTile
      blockFillContent
      key={track?.trackId}
      videoStream={track?.stream || undefined}
      layers={<PeerInfoLayer bottomLeft={<NameTag name={peer?.emoji || "Unknown"} />} />}
    />
  );
};
