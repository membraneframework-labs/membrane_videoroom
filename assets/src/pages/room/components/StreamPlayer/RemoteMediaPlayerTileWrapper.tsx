import type { TrackId } from "membrane-react-webrtc-client";
import { useSelector } from "../../../../libraryUsage/setup";
import type { LibraryTrackMinimal, PeerGui } from "../../../../libraryUsage/customSelectors";
import {
  createIsActiveTrackSelector,
  createPeerGuiSelector,
  createTrackEncodingSelector,
  createTracksRecordSelector,
} from "../../../../libraryUsage/customSelectors";
import PeerInfoLayer from "./PeerInfoLayer";
import MicrophoneOff from "../../../../features/room-page/icons/MicrophoneOff";
import React from "react";
import { useSimulcastRemoteEncoding } from "../../hooks/useSimulcastRemoteEncoding";
import MediaPlayerTile from "./MediaPlayerTile";
import { SimulcastRemoteLayer } from "./simulcast/SimulcastRemoteLayer";
import InitialsImage from "../../../../features/room-page/components/InitialsImage";
import type { TrackType } from "../../../types";

type InitialsImageWrapperProps = {
  initials: string;
  videoTrackId: TrackId | null;
};

const InitialsImageWrapper = ({ videoTrackId, initials }: InitialsImageWrapperProps) => {
  const enable = useSelector(createIsActiveTrackSelector(videoTrackId));

  return !enable ? <InitialsImage initials={initials} /> : <></>;
};

type DisabledMicIconProps = {
  isLoading: boolean;
};

const DisabledMicIcon = ({ isLoading }: DisabledMicIconProps) => {
  return (
    <div className="flex h-8 w-8 flex-wrap content-center justify-center rounded-full bg-white">
      <MicrophoneOff className={isLoading ? "animate-spin" : ""} fill="#001A72" />
    </div>
  );
};

export type MicIconWrapperProps = {
  audioTrackId: TrackId | null;
};

const MicIconWrapper = ({ audioTrackId }: MicIconWrapperProps) => {
  const enable = useSelector(createIsActiveTrackSelector(audioTrackId));

  return (
    <div className="flex flex-row items-center gap-x-2 text-xl">{!enable && <DisabledMicIcon isLoading={false} />}</div>
  );
};

export type PeerInfoWrapperProps = {
  peerId: string;
  tileSize: "L" | "M";
  audioTrackId: TrackId | null;
};

const PeerInfoWrapper = ({ peerId, tileSize, audioTrackId }: PeerInfoWrapperProps) => {
  const peer: PeerGui | null = useSelector(createPeerGuiSelector(peerId));

  return (
    <PeerInfoLayer
      bottomLeft={
        <div>
          {peer?.emoji} {peer?.name}
        </div>
      }
      topLeft={<MicIconWrapper audioTrackId={audioTrackId} />}
      tileSize={tileSize}
    />
  );
};

export type MediaPlayerTileWrapperProps = {
  peerId: string;
  showSimulcast?: boolean;
  className?: string;
  tileSize: "L" | "M";
};

export const RemoteMediaPlayerTileWrapper = ({
  peerId,
  showSimulcast,
  className,
  tileSize,
}: MediaPlayerTileWrapperProps) => {
  const tracks: Partial<Record<TrackType, LibraryTrackMinimal>> = useSelector(createTracksRecordSelector(peerId));
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
          <InitialsImageWrapper videoTrackId={tracks.camera?.trackId || null} initials={"WW"} />
          <PeerInfoWrapper tileSize={tileSize} peerId={peerId} audioTrackId={tracks.audio?.trackId || null} />
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
