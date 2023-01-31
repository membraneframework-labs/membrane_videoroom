import { useCallback, useEffect, useMemo, useState } from "react";
import { PeerMetadata, TrackMetadata } from "../pages/room/hooks/usePeerState";
import { TrackType } from "../pages/types";
import { selectBandwidthLimit } from "../pages/room/bandwidth";
import { UseMembraneClientType } from "../library/types";

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
  simulcast: boolean,
  stream: MediaStream | null,
  clientWrapper: UseMembraneClientType<PeerMetadata, TrackMetadata> | null,
): MembraneStreaming => {
  const [trackIds, setTrackIds] = useState<TrackIds | null>(null);
  const [trackMetadata, setTrackMetadata] = useState<TrackMetadata | null>(null);
  const defaultTrackMetadata = useMemo(() => ({ active: true, type }), [type]);

  const addTracks = useCallback(
    (stream: MediaStream) => {
      if (!clientWrapper?.api) return;
      const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();

      const track: MediaStreamTrack | undefined = tracks[0];
      if (!track) throw "Stream has no tracks!";

      const remoteTrackId = clientWrapper.api.addTrack(
        track,
        stream,
        defaultTrackMetadata,
        type === "camera" && simulcast ? { enabled: true, active_encodings: ["l", "m", "h"] } : undefined,
        selectBandwidthLimit(type, simulcast)
      );

      setTrackIds({ localId: track.id, remoteId: remoteTrackId });
      setTrackMetadata(defaultTrackMetadata);
    },
    [clientWrapper, defaultTrackMetadata, simulcast, type]
  );

  const replaceTrack = useCallback(
    (stream: MediaStream) => {
      if (!trackIds) return;
      if (!clientWrapper?.api) return;
      const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();

      const track: MediaStreamTrack | undefined = tracks[0];
      if (!track) throw "Stream has no tracks!";

      clientWrapper?.api?.replaceTrack(trackIds?.remoteId, track);
    },
    [clientWrapper, trackIds, type]
  );

  const removeTracks = useCallback(() => {
    if (!clientWrapper?.api) return;
    setTrackIds(null);
    setTrackMetadata(null);

    if (!trackIds) return;

    clientWrapper?.api?.removeTrack(trackIds.remoteId);
  }, [clientWrapper, trackIds]);

  useEffect(() => {
    console.log({ name: "autostart", clientWrapper, isConnected, mode });
    if (!clientWrapper?.api || !isConnected || mode !== "automatic") {
      return;
    }

    const tracks = type === "audio" ? stream?.getAudioTracks() : stream?.getVideoTracks();
    const localTrackId: string | undefined = (tracks || [])[0]?.id;

    console.log({ name: "after autostart", clientWrapper, isConnected, mode });

    if (stream && !trackIds) {
      addTracks(stream);
    } else if (stream && trackIds && trackIds.localId !== localTrackId) {
      replaceTrack(stream);
    } else if (!stream && trackIds) {
      removeTracks();
    }
  }, [stream, isConnected, addTracks, mode, removeTracks, trackIds, replaceTrack, type, clientWrapper]);

  const updateTrackMetadata = useCallback(
    (metadata: TrackMetadata) => {
      if (!clientWrapper?.api) return;

      if (!trackIds) return;
      clientWrapper?.api?.updateTrackMetadata(trackIds.remoteId, metadata);
      setTrackMetadata(metadata);
    },
    [clientWrapper, trackIds]
  );

  const setActive = useCallback(
    (status: boolean) => {
      updateTrackMetadata({ ...trackMetadata, active: status });
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
