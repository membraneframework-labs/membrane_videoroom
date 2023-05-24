import { toPairs } from "ramda";
import { create, State } from "@jellyfish-dev/react-client-sdk";
import { TrackWithId } from "./pages/types";
import { ApiTrack, RemotePeer } from "./pages/room/hooks/usePeerState";

const TrackTypeValues = ["screensharing", "camera", "audio"] as const;
export type TrackType = (typeof TrackTypeValues)[number];

export type PeerMetadata = {
  name: string;
};
export type TrackMetadata = {
  type: TrackType;
  active: boolean;
};

export const { useSelector, useConnect, JellyfishContextProvider } = create<PeerMetadata, TrackMetadata>();

export const useApi = () => useSelector((s) => s.connectivity.api);

export const useCurrentUserVideoTrackId = (): string | null =>
  useSelector(
    (s) =>
      Object.values(s?.local?.tracks || {})
        .filter((track) => track?.metadata?.type === "camera")
        .map((track) => track.trackId)[0] || null
  );

export const toLocalTrackSelector = (state: State<PeerMetadata, TrackMetadata>, type: TrackType) =>
  toPairs(state?.local?.tracks || {})
    .filter(([_, value]) => value?.metadata?.type === type)
    .map(([key, value]): TrackWithId => {
      const { stream, metadata, encoding } = value;
      return {
        stream: stream || undefined,
        remoteTrackId: key,
        metadata,
        isSpeaking: true,
        enabled: true,
        encodingQuality: encoding,
      };
    })[0] || null;

export const toRemotePeerSelector = (state: State<PeerMetadata, TrackMetadata>): RemotePeer[] => {
  return toPairs(state?.remote || {}).map(([peerId, peer]) => {
    const tracks: ApiTrack[] = toPairs(peer.tracks || {}).map(([trackId, track]) => {
      return {
        trackId,
        metadata: track.metadata || undefined,
        isSpeaking: false,
        encoding: "h",
        mediaStream: track.stream || undefined,
        mediaStreamTrack: track.track || undefined,
      };
    });

    return {
      id: peerId,
      displayName: peer?.metadata?.name || "",
      source: "remote",
      tracks,
    };
  });
};
