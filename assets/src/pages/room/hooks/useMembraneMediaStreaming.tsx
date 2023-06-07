import { useCallback, useEffect, useMemo, useState } from "react";
import { TrackType } from "../../types";
import { TrackMetadata, useApi } from "../../../jellifish.types";
import { Device } from "../../../features/devices/LocalPeerMediaContext";

export type MembraneStreaming = {
  trackId: string | null;
  removeTracks: () => void;
  addTracks: (stream: MediaStream) => void;
  setActive: (status: boolean) => void;
  updateTrackMetadata: (metadata: TrackMetadata) => void;
  trackMetadata: TrackMetadata | null;
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
  // const { simulcast } = useDeveloperInfo();
  // const simulcastEnabled = simulcast.status;

  const [trackMetadata, setTrackMetadata] = useState<TrackMetadata | null>(null);
  const defaultTrackMetadata = useMemo(() => ({ active: device.isEnabled, type }), [device.isEnabled, type]);

  const addTracks = useCallback(
    (stream: MediaStream) => {
      if (!api) return;
      const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();
      // const simulcast = simulcastEnabled && type === "camera";

      const track: MediaStreamTrack | undefined = tracks[0];

      if (!track) {
        console.error({ stream, type });
        throw Error("Stream has no tracks!");
      }

      const remoteTrackId = api.addTrack(
        track,
        stream,
        defaultTrackMetadata
        // simulcast ? { enabled: true, active_encodings: ["l", "m", "h"] } : undefined,
        // selectBandwidthLimit(type, simulcast)
      );

      setTrackIds({ localId: track.id, remoteId: remoteTrackId });
      setTrackMetadata(defaultTrackMetadata);
    },
    // [defaultTrackMetadata, simulcastEnabled, type, api]
    [defaultTrackMetadata, type, api]
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
    setTrackMetadata(null);

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

  const updateTrackMetadata = useCallback(
    (metadata: TrackMetadata) => {
      if (!trackIds) return;
      api?.updateTrackMetadata(trackIds.remoteId, metadata);
      setTrackMetadata(metadata);
    },
    [api, trackIds]
  );

  const setActive = useCallback(
    (status: boolean) => {
      if (trackMetadata) {
        updateTrackMetadata({ ...trackMetadata, active: status });
      }
      throw Error("Track metadata is null!");
    },
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
