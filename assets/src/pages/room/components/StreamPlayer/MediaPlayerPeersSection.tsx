import React, { FC } from "react";
import MediaPlayerTile from "./MediaPlayerTile";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import clsx from "clsx";
import { TrackType } from "../../../types";
import PeerInfoLayer from "./PeerInfoLayer";
import MicrophoneOff from "../../../../features/room-page/icons/MicrophoneOff";
import { LibraryTrackMinimal, PeerId } from "../../../../library/state.types";
import { createLocalPeerIdsSelector, createPeerIdsSelector } from "../../../../library/selectors";
import {
  createAudioTrackStatusSelector,
  createLocalPeerGuiSelector,
  createLocalTracksRecordSelector,
  createPeerGuiSelector,
  createTrackEncodingSelector,
  createTracksRecordSelector,
  PeerGui,
} from "../../../../libraryUsage/customSelectors";
import { SimulcastRemoteLayer } from "./simulcast/SimulcastRemoteLayer";
import { useSimulcastRemoteEncoding } from "../../hooks/useSimulcastRemoteEncoding";
import { SimulcastEncodingToSend } from "./simulcast/SimulcastEncodingToSend";
import { UseSimulcastLocalEncoding, useSimulcastSend } from "../../hooks/useSimulcastSend";
import { useSelector } from "../../../../libraryUsage/setup";

export type TrackWithId = {
  stream?: MediaStream;
  remoteTrackId: string | null;
  encodingQuality?: TrackEncoding;
  metadata?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  enabled?: boolean;
};

type Props = {
  oneColumn?: boolean;
};

type MediaPlayerTileWrapperProps = {
  peerId: string;
  showSimulcast?: boolean;
};
//
const RemoteMediaPlayerTileWrapper = ({ peerId, showSimulcast }: MediaPlayerTileWrapperProps) => {
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
      audioStream={tracks.audio?.stream || null}
      videoStream={tracks.camera?.stream || null}
      playAudio={true}
      layers={
        <>
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

export type LocalPeerMediaPlayerWrapperProps = {
  showSimulcast?: boolean;
};

const LocalPeerMediaPlayerWrapper = ({ showSimulcast }: LocalPeerMediaPlayerWrapperProps) => {
  const tracks: Partial<Record<TrackType, LibraryTrackMinimal>> = useSelector(createLocalTracksRecordSelector());
  const peer: PeerGui | null = useSelector(createLocalPeerGuiSelector());
  const localEncoding: UseSimulcastLocalEncoding = useSimulcastSend(tracks.camera?.trackId || null);

  return (
    <MediaPlayerTile
      audioStream={null}
      videoStream={tracks.camera?.stream || null}
      flipHorizontally={true}
      playAudio={false}
      layers={
        <>
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

const MediaPlayerPeersSection: FC<Props> = ({ oneColumn }: Props) => {
  const localPeerId: PeerId | null = useSelector(createLocalPeerIdsSelector());
  const remotePeersIds: Array<PeerId> = useSelector(createPeerIdsSelector());

  return (
    <div
      id="videos-grid"
      className={clsx({
        "grid h-full w-full flex-1 grid-flow-row grid-cols-1 justify-items-center gap-4": true,
        "md:grid-cols-2": !oneColumn,
      })}
    >
      {localPeerId && <LocalPeerMediaPlayerWrapper showSimulcast={true} />}
      {remotePeersIds.map((peerId) => (
        <RemoteMediaPlayerTileWrapper key={peerId} peerId={peerId} showSimulcast={true} />
      ))}
    </div>
  );
};

export default MediaPlayerPeersSection;
