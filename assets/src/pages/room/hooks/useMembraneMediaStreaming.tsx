import { useCallback, useEffect, useMemo, useState } from "react";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import { TrackType } from "../../types";

export type MembraneStreaming = {
  tracksId: string[];
  removeTracks: () => void;
  addTracks: (stream: MediaStream) => void;
  setActive: (status: boolean) => void;
  updateTrackMetadata: (metadata: any) => void;
  // todo make track metadata generic
  trackMetadata: any;
};

export type StreamingMode = "manual" | "automatic";

export const useMembraneMediaStreaming = (
  mode: StreamingMode,
  type: TrackType,
  isConnected: boolean,
  webrtc?: MembraneWebRTC,
  stream?: MediaStream
): MembraneStreaming => {
  const [tracksId, setTracksId] = useState<string[]>([]);
  const [webrtcState, setWebrtcState] = useState<MembraneWebRTC | undefined>(webrtc);
  const [trackMetadata, setTrackMetadata] = useState<any>();
  const defaultTrackMetadata = useMemo(() => ({ active: true, type: type }), [type]);

  const addTracks = useCallback(
    (stream: MediaStream) => {
      if (!webrtc) return;
      const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();

      const tracksId: string[] = tracks.map((track, idx) =>
        webrtc.addTrack(
          track,
          stream,
          defaultTrackMetadata,
          type == "camera" ? { enabled: true, active_encodings: ["l", "m", "h"] } : undefined
        )
      );

      setTracksId((prevState) => [...prevState, ...tracksId]);
      setTrackMetadata(defaultTrackMetadata);
    },
    [defaultTrackMetadata, type, webrtc]
  );

  const removeTracks = useCallback(() => {
    console.log("remove track");
    setTracksId([]);
    tracksId.forEach((trackId) => {
      webrtc?.removeTrack(trackId);
    });
    setTrackMetadata(undefined);
  }, [webrtc, tracksId]);

  useEffect(() => {
    if (!webrtc || !isConnected || mode !== "automatic") {
      return;
    }

    if (stream && tracksId.length === 0) {
      addTracks(stream);
    } else if (!stream && tracksId.length > 0) {
      removeTracks();
    }
  }, [webrtc, stream, type, isConnected, tracksId, addTracks, mode, removeTracks]);

  useEffect(() => {
    setWebrtcState(webrtc);
  }, [webrtc, type]);

  const updateTrackMetadata = useCallback(
    (metadata: any) => {
      tracksId.forEach((trackId) => {
        webrtcState?.updateTrackMetadata(trackId, metadata);
      });
      setTrackMetadata(metadata);
    },
    [webrtcState, tracksId]
  );

  const setActive = useCallback(
    (status: boolean) => updateTrackMetadata({ ...trackMetadata, active: status }),
    [trackMetadata, updateTrackMetadata]
  );

  return { tracksId, removeTracks, addTracks, setActive, updateTrackMetadata, trackMetadata };
};
