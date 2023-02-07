import { LibraryTrackMinimal, PeerId } from "../../../../library/state.types";
import { useSelector } from "../../../../libraryUsage/setup";
import {
  createAudioTrackStatusSelector,
  createPeerGuiSelector,
  createTrackEncodingSelector,
  createTracksRecordSelector,
  PeerGui,
} from "../../../../libraryUsage/customSelectors";
import PeerInfoLayer from "./PeerInfoLayer";
import MicrophoneOff from "../../../../features/room-page/icons/MicrophoneOff";
import React from "react";
import { useSimulcastRemoteEncoding } from "../../hooks/useSimulcastRemoteEncoding";
import MediaPlayerTile from "./MediaPlayerTile";
import { SimulcastRemoteLayer } from "./simulcast/SimulcastRemoteLayer";
import InitialsImage from "../../../../features/room-page/components/InitialsImage";

export type MediaPlayerTileWrapperProps = {
  peerId: string;
  showSimulcast?: boolean;
  className?: string;
};

export const RemoteMediaPlayerTileWrapper = ({ peerId, showSimulcast, className }: MediaPlayerTileWrapperProps) => {
  const tracks: Partial<Record<string, LibraryTrackMinimal>> = useSelector(createTracksRecordSelector(peerId));
  const peer: PeerGui | null = useSelector(createPeerGuiSelector(peerId));
  const encoding = useSelector(createTrackEncodingSelector(tracks?.camera?.trackId || null));
  const { desiredEncoding, setDesiredEncoding } = useSimulcastRemoteEncoding(
    "m",
    peerId || null,
    tracks.camera?.trackId || null
  );

  return (
    <MediaPlayerTile
      audioStream={tracks.audio?.stream || undefined}
      videoStream={tracks.camera?.stream || undefined}
      playAudio={true}
      className={className}
      layers={
        <>
          {/* TODO handle initials and disabled track*/}
          {tracks.camera?.stream ? null : <InitialsImage initials={"XX"} />}
          <PeerInfoLayer
            bottomLeft={
              <div>
                {peer?.emoji} {peer?.name}
              </div>
            }
          />
          <RemoteLayer peerId={peerId} />
          {showSimulcast && (
            <SimulcastRemoteLayer
              desiredEncoding={desiredEncoding}
              setDesiredEncoding={setDesiredEncoding}
              currentEncoding={encoding}
              disabled={!tracks.camera?.stream}
            />
          )}
        </>
      }
    />
  );
};

type RemoteLayerProps = {
  peerId: PeerId;
};

const RemoteLayer = ({ peerId }: RemoteLayerProps) => {
  const audioStatus = useSelector(createAudioTrackStatusSelector(peerId));

  return (
    <PeerInfoLayer
      topLeft={
        <div className="flex flex-row items-center gap-x-2 text-xl">
          {audioStatus === "muted" && <MicrophoneOff />}
          {audioStatus === "active" && "Active"}
          {audioStatus === null && "None"}
        </div>
      }
    />
  );
};
