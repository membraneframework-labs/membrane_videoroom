import { JellyfishClient } from "./JellyfishClient";
import { SimulcastConfig, TrackBandwidthLimit, TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { Dispatch } from "react";
import { Action } from "./create";

// todo implement
//  setTrackBandwidth
//  setEncodingBandwidth
//  prioritizeTrack
//  unprioritizeTrack
//  setPreferedVideoSizes
//  updatePeerMetadata
export type Api<TrackMetadata> = {
  addTrack: (
    track: MediaStreamTrack,
    stream: MediaStream,
    trackMetadata?: TrackMetadata,
    simulcastConfig?: SimulcastConfig,
    maxBandwidth?: TrackBandwidthLimit
  ) => string;
  replaceTrack: (
    trackId: string,
    newTrack: MediaStreamTrack,
    stream: MediaStream,
    newTrackMetadata?: TrackMetadata
  ) => Promise<boolean>;
  removeTrack: (trackId: string) => void;
  updateTrackMetadata: (trackId: string, trackMetadata: TrackMetadata) => void;
  disableTrackEncoding: (trackId: string, encoding: TrackEncoding) => void;
  enableTrackEncoding: (trackId: string, encoding: TrackEncoding) => void;
  setTargetTrackEncoding: (trackId: string, encoding: TrackEncoding) => void;
};

/**
 * Creates a wrapper for the MembraneWebRTC instance to enable updating the store.
 *
 * @param webrtc - MembraneWebRTC instance
 * @param dispatch - function that sets the store
 * @returns Wrapper for the MembraneWebRTC instance
 */
export const createApiWrapper = <PeerMetadata, TrackMetadata>(
  webrtc: JellyfishClient<PeerMetadata, TrackMetadata>,
  dispatch: Dispatch<Action<PeerMetadata, TrackMetadata>>
): Api<TrackMetadata> => ({
  addTrack: (
    track: MediaStreamTrack,
    stream: MediaStream,
    trackMetadata?: TrackMetadata,
    simulcastConfig?: SimulcastConfig,
    maxBandwidth?: TrackBandwidthLimit
  ) => {
    console.log("createApiWrapper--addTrack");
    const remoteTrackId = webrtc.addTrack(track, stream, trackMetadata, simulcastConfig, maxBandwidth);
    dispatch({ type: "localAddTrack", remoteTrackId, track, stream, trackMetadata, simulcastConfig });
    return remoteTrackId;
  },

  replaceTrack: (trackId, newTrack, stream, newTrackMetadata) => {
    console.log("createApiWrapper--addTrack");

    const promise = webrtc.replaceTrack(trackId, newTrack, newTrackMetadata);
    dispatch({ type: "localReplaceTrack", trackId, newTrack, stream, newTrackMetadata });
    return promise;
  },

  removeTrack: (trackId) => {
    console.log("createApiWrapper--removeTrack");

    webrtc.removeTrack(trackId);
    dispatch({ type: "localRemoveTrack", trackId });
  },

  updateTrackMetadata: (trackId, trackMetadata) => {
    console.log("createApiWrapper--updateTrackMetadata");

    webrtc.updateTrackMetadata(trackId, trackMetadata);
    dispatch({ type: "localUpdateTrackMetadata", trackId, trackMetadata });
  },

  enableTrackEncoding: (trackId, encoding) => {
    console.log("createApiWrapper--enableTrackEncoding");

    webrtc.enableTrackEncoding(trackId, encoding);
  },

  disableTrackEncoding: (trackId: string, encoding: TrackEncoding): void => {
    console.log("createApiWrapper--disableTrackEncoding");

    webrtc.disableTrackEncoding(trackId, encoding);
  },

  setTargetTrackEncoding: (trackId, encoding) => {
    console.log("createApiWrapper--setTargetTrackEncoding");

    webrtc.setTargetTrackEncoding(trackId, encoding);
  },
});
