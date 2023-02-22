import { Track } from "../../../pages/room/hooks/usePeerState";
import { TrackWithId } from "../../../pages/types";

export const remoteTrackToLocalTrack = (localPeer: Track | undefined): TrackWithId | null =>
  localPeer ? { ...localPeer, remoteTrackId: localPeer.trackId } : null;
