import { useCallback, useEffect, useMemo, useState } from "react";
import { MembraneWebRTC } from "@jellyfish-dev/membrane-webrtc-js";
import { TrackType } from "../../types";
import { selectBandwidthLimit } from "../bandwidth";
import { useSelector } from "../../../jellifish.types";

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
  simulcastEnabled: boolean,
  // webrtc: MembraneWebRTC | null,
  stream: MediaStream | null,
  isEnabled: boolean
): MembraneStreaming => {
  const [trackIds, setTrackIds] = useState<TrackIds | null>(null);

  const api = useSelector((s) => s.connectivity.api)

  // const [webrtcState, setWebrtcState] = useState<MembraneWebRTC | null>(webrtc);
  const [trackMetadata, setTrackMetadata] = useState<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
  const defaultTrackMetadata = useMemo(() => ({ active: isEnabled, type }), [isEnabled, type]);

  const addTracks = useCallback(
    (stream: MediaStream) => {
      if (!api) return;
      const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();
      // const simulcast = simulcastEnabled && type === "camera";
      const simulcast = false

      const track: MediaStreamTrack | undefined = tracks[0];

      if (!track) {
        console.error({ stream, type });
        throw Error("Stream has no tracks!");
      }

      const remoteTrackId = api.addTrack(
        track,
        stream,
        defaultTrackMetadata,
        simulcast ? { enabled: true, active_encodings: ["l", "m", "h"] } : undefined,
        selectBandwidthLimit(type, simulcast)
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

    const tracks = type === "audio" ? stream?.getAudioTracks() : stream?.getVideoTracks();
    const localTrackId: string | undefined = (tracks || [])[0]?.id;

    if (stream && !trackIds) {
      addTracks(stream);
    } else if (stream && trackIds && trackIds.localId !== localTrackId) {
      replaceTrack(stream);
    } else if (!stream && trackIds) {
      removeTracks();
    }
  }, [api, stream, isConnected, addTracks, mode, removeTracks, trackIds, replaceTrack, type]);

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
