import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";

// todo Change TrackEncoding to something like EncodingType in "@membraneframework/membrane-webrtc-js"
const EncodingValues = ["l", "m", "h"] as const;
type EncodingType = typeof EncodingValues[number];

export const isTrackEncoding = (value: string): value is TrackEncoding =>
  EncodingValues.includes(value as TrackEncoding);
