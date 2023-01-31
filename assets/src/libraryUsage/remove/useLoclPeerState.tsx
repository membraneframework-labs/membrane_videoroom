import { useCallback, useMemo, useState } from "react";
import { TrackType } from "../../pages/types";
import { LibraryLocalPeer, LibraryTrack, TrackId, Tracks } from "../../library/types";

export type SetLocalPeer<GenericPeerMetadata> = (id: string, metadata: GenericPeerMetadata | null) => void;
export type SetLocalStream = (type: TrackType, enabled: boolean, stream: MediaStream | undefined) => void;
export type SetLocalTrackId = (type: TrackType, trackId: string | null) => void;
export type SetLocalTrackMetadata<GenericPeerMetadata> = (
  type: TrackType,
  metadata: GenericPeerMetadata | null
) => void;

export type LocalPeerApi<GenericPeerMetadata> = {
  setLocalPeer: SetLocalPeer<GenericPeerMetadata>;
  setLocalStream: SetLocalStream;
  setLocalTrackId: SetLocalTrackId;
  setLocalTrackMetadata: SetLocalTrackMetadata<GenericPeerMetadata>;
};

export const useLocalTrackState = <TrackMetadataGeneric,>(): LibraryTrack<TrackMetadataGeneric> => {
  type Track = LibraryTrack<TrackMetadataGeneric> | null;
  const [state, setState] = useState<Track>(null);

  return state;
};
