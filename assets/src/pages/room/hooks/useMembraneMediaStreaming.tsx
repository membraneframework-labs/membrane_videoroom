import { useCallback, useEffect, useState } from "react";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import { TrackType } from "../../types";

type MembraneStreaming = {
  tracksId: string[];
  removeTracks: () => void;
  addTracks: (stream: MediaStream) => void;
  setActive: (status: boolean) => void;
};

export const useMembraneMediaStreaming = (
  mode: "manual" | "automatic",
  type: TrackType,
  isConnected: boolean,
  webrtc?: MembraneWebRTC,
  stream?: MediaStream
): MembraneStreaming => {
  const [tracksId, setTracksId] = useState<string[]>([]);
  const [webrtcState, setWebrtcState] = useState<MembraneWebRTC | undefined>(webrtc);
  const [typeState, setTypeState] = useState<TrackType>(type);

  const addTrackInner = useCallback((type: TrackType, webrtc: MembraneWebRTC, stream: MediaStream) => {
    console.log("addTrack");
    const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();

    const tracksId: string[] = tracks.map((track, idx) => {
      return webrtc.addTrack(
        track,
        stream,
        { active: true, type: type },
        type == "camera" ? { enabled: true, active_encodings: ["l", "m", "h"] } : undefined
      );
    });

    setTracksId((prevState) => {
      return [...prevState, ...tracksId];
    });
  }, []);

  const removeTrackInner = useCallback((webrtc: MembraneWebRTC, trackIds: string[]) => {
    console.log("remove track");
    setTracksId([]);
    trackIds.forEach((trackId) => {
      webrtc.removeTrack(trackId);
    });
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
  }, [webrtc, stream, type, isConnected, tracksId, removeTrackInner, addTrackInner]);

  useEffect(() => {
    setWebrtcState(webrtc);
    setTypeState(type);
  }, [webrtc, type]);

  const removeTracks = useCallback(() => {
    console.log("Remove tracks on click");
    tracksId.forEach((trackId) => {
      webrtcState?.removeTrack(trackId);
    });
    setTracksId([]);
  }, [webrtcState, tracksId]);

  const addTracks = useCallback(
    (stream: MediaStream) => {
      console.log("Add track on click");
      // todo better validation e.g.
      //  store map of browser track id to membrane track id
      //  filter already added tracks
      if (tracksId.length > 0) {
        console.log("Skipped");
        return;
      }

      const tracks = typeState === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();

      const newTrackIds: string[] | undefined = webrtcState
        ? tracks.map((track, idx) => {
            return webrtcState?.addTrack(
              track,
              stream,
              { active: true, type: typeState },
              typeState == "camera" ? { enabled: true, active_encodings: ["l", "m", "h"] } : undefined
            );
          })
        : undefined;

      if (newTrackIds) {
        setTracksId((prevState) => {
          return [...prevState, ...newTrackIds];
        });
      }
    },
    [webrtcState, typeState, tracksId]
  );

  const setActive = useCallback(
    (status: boolean) => {
      console.log({ name: `Set active ${status}`, tracksId });

      tracksId.forEach((trackId) => {
        webrtcState?.updateTrackMetadata(trackId, { active: status, type: type });
      });
    },
    [webrtcState, tracksId, type]
  );

  return { tracksId, removeTracks, addTracks, setActive };
};
