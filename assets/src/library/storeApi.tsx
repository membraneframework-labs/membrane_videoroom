import { MembraneWebRTC, SimulcastConfig, TrackBandwidthLimit, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { ExternalState } from "./externalState";
import { addTrack, removeTrack, replaceTrack, updateTrackMetadata } from "./stateMappers";

// Potrzebujemy tej fasady, żeby automatycznie budować sobie wewnętrzny stan dla tracków użytkownika
export type StoreApi<TrackMetadataGeneric> = {
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
  disableTrackEncoding: (trackId: string, encoding: TrackEncoding) => void;
  enableTrackEncoding: (trackId: string, encoding: TrackEncoding) => void;
  setTargetTrackEncoding: (trackId: string, encoding: TrackEncoding) => void;
};

export const createApiWrapper = <PeerMetadataGeneric, TrackMetadataGeneric>(
  webrtc: MembraneWebRTC,
  store: ExternalState<PeerMetadataGeneric, TrackMetadataGeneric>
): StoreApi<TrackMetadataGeneric> => ({
  addTrack: (
    track: MediaStreamTrack,
    stream: MediaStream,
    trackMetadata?: TrackMetadataGeneric,
    simulcastConfig?: SimulcastConfig,
    maxBandwidth?: TrackBandwidthLimit
  ) => {
    const remoteTrackId = webrtc.addTrack(track, stream, trackMetadata, simulcastConfig, maxBandwidth);
    store.setStore(addTrack(remoteTrackId, track, stream, trackMetadata, simulcastConfig));
    return remoteTrackId;
  },

  replaceTrack: (trackId, newTrack, newTrackMetadata) => {
    const promise = webrtc.replaceTrack(trackId, newTrack, newTrackMetadata);
    store.setStore(replaceTrack(trackId, newTrack, newTrackMetadata));
    return promise;
  },

  removeTrack: (trackId) => {
    webrtc.removeTrack(trackId);
    store.setStore(removeTrack(trackId));
  },

  updateTrackMetadata: (trackId, trackMetadata) => {
    webrtc.updateTrackMetadata(trackId, trackMetadata);
    store.setStore(updateTrackMetadata(trackId, trackMetadata));
  },

  enableTrackEncoding: (trackId, encoding) => {
    webrtc.enableTrackEncoding(trackId, encoding);
  },
  disableTrackEncoding: (trackId: string, encoding: TrackEncoding): void => {
    webrtc.disableTrackEncoding(trackId, encoding);
  },
  setTargetTrackEncoding: (trackId, encoding) => {
    webrtc.setTargetTrackEncoding(trackId, encoding);
  },
});
