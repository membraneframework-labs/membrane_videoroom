import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";

// todo Change TrackEncoding to something like EncodingType in "@jellyfish-dev/membrane-webrtc-js"
const EncodingValues = ["l", "m", "h"] as const;
type EncodingType = (typeof EncodingValues)[number]; // eslint-disable-line @typescript-eslint/no-unused-vars

export const isTrackEncoding = (value: string): value is TrackEncoding =>
  EncodingValues.includes(value as TrackEncoding);

const TrackTypeValues = ["screensharing", "camera", "audio"] as const;
export type TrackType = (typeof TrackTypeValues)[number];

export const isTrackType = (value: string): value is TrackType => TrackTypeValues.includes(value as TrackType);

const StreamSourceValues = ["local", "remote"] as const;
export type StreamSource = (typeof StreamSourceValues)[number];

export type TrackWithId = {
  stream?: MediaStream;
  remoteTrackId: string | null;
  encodingQuality: TrackEncoding | null;
  metadata?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isSpeaking?: boolean;
  enabled?: boolean;
};

// Media Tile Types
type CommonTile = {
  mediaPlayerId: string;
  peerId: string;
  video: TrackWithId | null;
  displayName: string;
  streamSource: StreamSource;
};

export type PeerTileConfig = {
  typeName: StreamSource;
  audio: TrackWithId | null;
  isSpeaking: boolean;
  initials: string;
} & CommonTile;

export type ScreenShareTileConfig = {
  typeName: "screenShare";
} & CommonTile;

export type MediaPlayerTileConfig = PeerTileConfig | ScreenShareTileConfig;
