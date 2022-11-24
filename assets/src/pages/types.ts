import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";

// todo Change TrackEncoding to something like EncodingType in "@membraneframework/membrane-webrtc-js"
const EncodingValues = ["l", "m", "h"] as const;
type EncodingType = typeof EncodingValues[number]; // eslint-disable-line @typescript-eslint/no-unused-vars

export const isTrackEncoding = (value: string): value is TrackEncoding =>
  EncodingValues.includes(value as TrackEncoding);

const TrackTypeValues = ["screensharing", "camera", "audio"] as const;
export type TrackType = typeof TrackTypeValues[number];

export const isTrackType = (value: string): value is TrackType => TrackTypeValues.includes(value as TrackType);

const StreamSourceValues = ["local", "remote"] as const;
export type StreamSource = typeof StreamSourceValues[number];
