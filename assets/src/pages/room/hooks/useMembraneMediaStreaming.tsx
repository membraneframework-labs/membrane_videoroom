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

  const addTrackInner = useCallback(
    (type: TrackType, webrtc: MembraneWebRTC, stream: MediaStream) => {
      console.log("addTrack");
      const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();

      const tracksId: string[] = tracks.map((track, idx) => {
        return webrtc.addTrack(
          track,
          stream,
          defaultTrackMetadata,
          type == "camera" ? { enabled: true, active_encodings: ["l", "m", "h"] } : undefined
        );
      });

      setTracksId((prevState) => {
        return [...prevState, ...tracksId];
      });
      setTrackMetadata(defaultTrackMetadata);
    },
    [defaultTrackMetadata]
  );

  const removeTrackInner = useCallback((webrtc: MembraneWebRTC, trackIds: string[]) => {
    console.log("remove track");
    setTracksId([]);
    trackIds.forEach((trackId) => {
      webrtc.removeTrack(trackId);
    });
    setTrackMetadata(undefined);
  }, []);

  useEffect(() => {
    if (!webrtc || !isConnected || mode !== "automatic") {
      return;
    }

    if (stream && tracksId.length === 0) {
      addTrackInner(type, webrtc, stream);
    } else if (!stream && tracksId.length > 0) {
      removeTrackInner(webrtc, tracksId);
    }
  }, [webrtc, stream, type, isConnected, tracksId, removeTrackInner, addTrackInner, mode]);

  useEffect(() => {
    setWebrtcState(webrtc);
  }, [webrtc, type]);

  // todo merge with inner
  const removeTracks = useCallback(() => {
    console.log("Remove tracks on click");
    tracksId.forEach((trackId) => {
      webrtcState?.removeTrack(trackId);
    });
    setTracksId([]);
    setTrackMetadata(undefined);
  }, [webrtcState, tracksId]);

  const addTracks = useCallback(
    (stream: MediaStream) => {
      console.log("Add track on click");
      // todo better validation e.g.
      //  store map of browser track id to membrane track id
      //  filter already added tracks
      if (!webrtcState) return;

      addTrackInner(type, webrtcState, stream);
      // if (tracksId.length > 0) {
      //   console.log("Skipped");
      //   return;
      // }
      //
      // const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();
      //
      // const newTrackIds: string[] | undefined = webrtcState
      //   ? tracks.map((track, idx) => {
      //       return webrtcState?.addTrack(
      //         track,
      //         stream,
      //         trackMetadata,
      //         type == "camera" ? { enabled: true, active_encodings: ["l", "m", "h"] } : undefined
      //       );
      //     })
      //   : undefined;
      //
      // if (newTrackIds) {
      //   setTracksId((prevState) => {
      //     return [...prevState, ...newTrackIds];
      //   });
      // }
    },
    [webrtcState, addTrackInner, type]
  );

  const updateTrackMetadata = useCallback(
    (metadata: any) => {
      console.log({ name: `updateTrackMetadata 2`, metadata });

      // const newMetadata = { ...trackMetadata, ...metadata };

      tracksId.forEach((trackId) => {
        webrtcState?.updateTrackMetadata(trackId, metadata);
      });
    },
    [webrtcState, tracksId]
  );

  const setActive = useCallback(
    (status: boolean) => updateTrackMetadata({ ...trackMetadata, active: status }),
    [trackMetadata, updateTrackMetadata]
  );

  return { tracksId, removeTracks, addTracks, setActive, updateTrackMetadata, trackMetadata };
};
