import { useCallback, useEffect, useMemo, useState } from "react";
import { MembraneWebRTC } from "@jellyfish-dev/membrane-webrtc-js";
import { TrackType } from "../../types";
import { selectBandwidthLimit } from "../bandwidth";
import { useApi, useSelector } from "../../../jellifish.types";
import { useDeveloperInfo } from "../../../contexts/DeveloperInfoContext";
import { Device } from "../../../features/devices/LocalPeerMediaContext";

export type MembraneStreaming = {
  trackId: string | null;
  removeTracks: () => void;
  addTracks: (stream: MediaStream) => void;
  setActive: (status: boolean) => void;
  updateTrackMetadata: (metadata: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  trackMetadata: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type StreamingMode = "manual" | "automatic";

type TrackIds = {
  localId: string;
  remoteId: string;
};

export const useMembraneMediaStreaming = (
  mode: StreamingMode,
  type: TrackType,
  isConnected: boolean,
  device: Device
): MembraneStreaming => {
  const [trackIds, setTrackIds] = useState<TrackIds | null>(null);

  const api = useApi();
  const { simulcast } = useDeveloperInfo();
  const simulcastEnabled = false;
  // const simulcastEnabled = simulcast.status;

  // const [webrtcState, setWebrtcState] = useState<MembraneWebRTC | null>(webrtc);
  const [trackMetadata, setTrackMetadata] = useState<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
  const defaultTrackMetadata = useMemo(() => ({ active: device.isEnabled, type }), [device.isEnabled, type]);

  const addTracks = useCallback(
    (stream: MediaStream) => {
      if (!api) return;
      const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();
      const simulcast = simulcastEnabled && type === "camera";
      // const simulcast = false

      const track: MediaStreamTrack | undefined = tracks[0];

      if (!track) {
        console.error({ stream, type });
        throw Error("Stream has no tracks!");
      }

      console.log({
        name: "Adding track",
        stream,
        track,
        defaultTrackMetadata,
        simulcast: simulcast ? { enabled: true, active_encodings: ["l", "m", "h"] } : undefined,
        bandwidth: selectBandwidthLimit(type, simulcast),
      });
      const remoteTrackId = api.addTrack(
        track,
        stream,
        defaultTrackMetadata,
        // simulcast ? { enabled: true, active_encodings: ["l", "m", "h"] } : undefined,
        // selectBandwidthLimit(type, simulcast)
      );

      setTrackIds({ localId: track.id, remoteId: remoteTrackId });
      setTrackMetadata(defaultTrackMetadata);
    },
    [defaultTrackMetadata, simulcastEnabled, type, api]
  );

  const replaceTrack = useCallback(
    (stream: MediaStream) => {
      if (!api || !trackIds) return;
      const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();

      const track: MediaStreamTrack | undefined = tracks[0];
      if (!track) {
        console.error({ stream, type });
        throw Error("Stream has no tracks!");
      }

      api.replaceTrack(trackIds?.remoteId, track, stream);
    },
    [trackIds, type, api]
  );

  const removeTracks = useCallback(() => {
    setTrackIds(null);
    setTrackMetadata(undefined);

    if (!api || !trackIds) return;

    api.removeTrack(trackIds.remoteId);
  }, [api, trackIds]);

  useEffect(() => {
    if (!api || !isConnected || mode !== "automatic") {
      return;
    }
    const stream = device.stream;

    const tracks = type === "audio" ? stream?.getAudioTracks() : stream?.getVideoTracks();
    const localTrackId: string | undefined = (tracks || [])[0]?.id;

    if (stream && !trackIds) {
      addTracks(stream);
    } else if (stream && trackIds && trackIds.localId !== localTrackId) {
      replaceTrack(stream);
    } else if (!stream && trackIds) {
      removeTracks();
    }
  }, [api, device.stream, device.isEnabled, isConnected, addTracks, mode, removeTracks, trackIds, replaceTrack, type]);

  // useEffect(() => {
  //   setWebrtcState(webrtc || null);
  // }, [webrtc, type]);

  const updateTrackMetadata = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (metadata: any) => {
      if (!trackIds) return;
      api?.updateTrackMetadata(trackIds.remoteId, metadata);
      setTrackMetadata(metadata);
    },
    [api, trackIds]
  );

  const setActive = useCallback(
    (status: boolean) => updateTrackMetadata({ ...trackMetadata, active: status }),
    [trackMetadata, updateTrackMetadata]
  );

  return {
    trackId: trackIds?.remoteId || null,
    removeTracks,
    addTracks,
    setActive,
    updateTrackMetadata,
    trackMetadata,
  };
};
