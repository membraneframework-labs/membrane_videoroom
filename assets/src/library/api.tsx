import { SimulcastConfig, TrackBandwidthLimit } from "@jellyfish-dev/membrane-webrtc-js";

export type MembraneApi<TrackMetadataGeneric> = {
  addTrack: (
    track: MediaStreamTrack,
    stream: MediaStream,
    trackMetadata?: TrackMetadataGeneric,
    simulcastConfig?: SimulcastConfig,
    maxBandwidth?: TrackBandwidthLimit
  ) => string;
  replaceTrack: (
    trackId: string,
    newTrack: MediaStreamTrack,
    newTrackMetadata?: TrackMetadataGeneric
  ) => Promise<boolean>;
  removeTrack: (trackId: string) => void;
  updateTrackMetadata: (trackId: string, trackMetadata: TrackMetadataGeneric) => void;
};
