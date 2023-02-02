import { useCallback, useEffect, useMemo, useState } from "react";
import { PeerMetadata, TrackMetadata } from "../pages/room/hooks/usePeerState";
import { TrackType } from "../pages/types";
import { selectBandwidthLimit } from "../pages/room/bandwidth";
import { UseMembraneClientType } from "../library/state.types";
import { useSelector2 } from "./setup";
import { createConnectivitySelector } from "../library/selectors";
import {useLog} from "../helpers/UseLog";

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
  stream: MediaStream | null
): MembraneStreaming => {
  const api = useSelector2(createConnectivitySelector());

  // useLog(api, "API!!")

  const [trackIds, setTrackIds] = useState<TrackIds | null>(null);
  const [trackMetadata, setTrackMetadata] = useState<TrackMetadata | null>(null);
  const defaultTrackMetadata = useMemo(() => ({ active: true, type }), [type]);

  const addTracks = useCallback(
    (stream: MediaStream) => {
      if (!api?.api) return;
      const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();

      const track: MediaStreamTrack | undefined = tracks[0];
      if (!track) throw "Stream has no tracks!";

      const remoteTrackId = api.api?.addTrack(
        track,
        stream,
        defaultTrackMetadata,
        type === "camera" && simulcast ? { enabled: true, active_encodings: ["l", "m", "h"] } : undefined,
        selectBandwidthLimit(type, simulcast)
      );

      setTrackIds({ localId: track.id, remoteId: remoteTrackId });
      setTrackMetadata(defaultTrackMetadata);
    },
    [api, defaultTrackMetadata, simulcast, type]
  );

  const replaceTrack = useCallback(
    (stream: MediaStream) => {
      if (!trackIds) return;
      if (!api) return;
      const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();

      const track: MediaStreamTrack | undefined = tracks[0];
      if (!track) throw "Stream has no tracks!";

      api.api?.replaceTrack(trackIds?.remoteId, track);
    },
    [api, trackIds, type]
  );

  const removeTracks = useCallback(() => {
    if (!api) return;
    setTrackIds(null);
    setTrackMetadata(null);

    if (!trackIds) return;

    api.api?.removeTrack(trackIds.remoteId);
  }, [api, trackIds]);

  useEffect(() => {
    // console.log({ name: "autostart", api, isConnected, mode });
    if (!api || !isConnected || mode !== "automatic") {
      return;
    }

    const tracks = type === "audio" ? stream?.getAudioTracks() : stream?.getVideoTracks();
    const localTrackId: string | undefined = (tracks || [])[0]?.id;

    // console.log({ name: "after autostart", api, isConnected, mode });

    if (stream && !trackIds) {
      addTracks(stream);
    } else if (stream && trackIds && trackIds.localId !== localTrackId) {
      replaceTrack(stream);
    } else if (!stream && trackIds) {
      removeTracks();
    }
  }, [stream, isConnected, addTracks, mode, removeTracks, trackIds, replaceTrack, type, api]);

  const updateTrackMetadata = useCallback(
    (metadata: TrackMetadata) => {
      if (!api) return;

      if (!trackIds) return;
      api.api?.updateTrackMetadata(trackIds.remoteId, metadata);
      setTrackMetadata(metadata);
    },
    [api, trackIds]
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
