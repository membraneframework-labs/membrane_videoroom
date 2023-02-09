import type { TrackType } from "../../../types";
import type { LibraryTrackMinimal } from "membrane-react-webrtc-client";
import { useSelector } from "../../../../libraryUsage/setup";
import type {
  PeerGui} from "../../../../libraryUsage/customSelectors";
import {
  createLocalPeerGuiSelector,
  createLocalTracksRecordSelector
} from "../../../../libraryUsage/customSelectors";
import type { UseSimulcastLocalEncoding} from "../../hooks/useSimulcastSend";
import { useSimulcastSend } from "../../hooks/useSimulcastSend";
import MediaPlayerTile from "./MediaPlayerTile";
import PeerInfoLayer from "./PeerInfoLayer";
import { SimulcastEncodingToSend } from "./simulcast/SimulcastEncodingToSend";
import React from "react";
import InitialsImage from "../../../../features/room-page/components/InitialsImage";

export type LocalPeerMediaPlayerWrapperProps = {
  showSimulcast?: boolean;
  className?: string;
};

export const LocalPeerMediaPlayerWrapper = ({ showSimulcast, className }: LocalPeerMediaPlayerWrapperProps) => {
  const tracks: Partial<Record<TrackType, LibraryTrackMinimal>> = useSelector(createLocalTracksRecordSelector());
  const peer: PeerGui | null = useSelector(createLocalPeerGuiSelector());
  const localEncoding: UseSimulcastLocalEncoding = useSimulcastSend(tracks.camera?.trackId || null);

  return (
    <MediaPlayerTile
      videoStream={tracks.camera?.stream || undefined}
      flipHorizontally={true}
      playAudio={false}
      className={className}
      layers={
        <>
          {/* todo handle track metadata disabled*/}
          {tracks.camera?.stream ? null : <InitialsImage initials={"XX"} />}

          <PeerInfoLayer
            bottomLeft={
              <div>
                {peer?.emoji} {peer?.name}
              </div>
            }
          />
          {showSimulcast && <SimulcastEncodingToSend localEncoding={localEncoding} disabled={!tracks.camera?.stream} />}
        </>
      }
    />
  );
};
