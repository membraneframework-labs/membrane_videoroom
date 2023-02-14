import { TrackWithId } from "../../../pages/room/components/StreamPlayer/MediaPlayerPeersSection";
import { Track } from "../../../pages/room/hooks/usePeerState";

export const remoteTrackToLocalTrack = (localPeer: Track | undefined): TrackWithId | null =>
  localPeer ? { ...localPeer, remoteTrackId: localPeer.trackId } : null;
