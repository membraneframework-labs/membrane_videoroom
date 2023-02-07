import { TrackType } from "../../../types";
import { LibraryTrackMinimal } from "../../../../library/state.types";
import { useSelector } from "../../../../libraryUsage/setup";
import {
  createLocalPeerGuiSelector,
  createLocalTracksRecordSelector,
  PeerGui,
} from "../../../../libraryUsage/customSelectors";
import { UseSimulcastLocalEncoding, useSimulcastSend } from "../../hooks/useSimulcastSend";
import MediaPlayerTile from "./MediaPlayerTile";
import PeerInfoLayer from "./PeerInfoLayer";
import { SimulcastEncodingToSend } from "./simulcast/SimulcastEncodingToSend";
import React from "react";
import InitialsImage from "../../../../features/room-page/components/InitialsImage";

export type LocalPeerMediaPlayerWrapperProps = {
  showSimulcast?: boolean;
  className?: string
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