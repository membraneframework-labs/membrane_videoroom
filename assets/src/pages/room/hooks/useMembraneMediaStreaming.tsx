import { useCallback, useEffect, useState } from "react";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import { TrackType } from "../../types";

export function useMembraneMediaStreaming(type: TrackType, webrtc?: MembraneWebRTC, stream?: MediaStream): string[] {
  const [tracksId, setTracksId] = useState<string[]>([]);

  const addTrack = useCallback((type: TrackType, webrtc: MembraneWebRTC, stream: MediaStream) => {
    const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();

    const tracksId: string[] = tracks.map((track, idx) => {
      const trackId: string = webrtc.addTrack(
        track,
        stream,
        { active: true, type: type },
        // todo handle screensharing and audio
        { enabled: true, active_encodings: ["l", "m", "h"] }
      );
      return trackId;
    });

    setTracksId((prevState) => {
      return [...prevState, ...tracksId];
    });
  }, []);

  const removeTrack = useCallback((webrtc: MembraneWebRTC, trackIds: string[]) => {
    setTracksId([]);
    trackIds.forEach((trackId) => {
      webrtc.removeTrack(trackId);
    });
  }, []);

  useEffect(() => {
    if (!webrtc) {
      return;
    }
    if (stream && tracksId.length === 0) {
      addTrack(type, webrtc, stream);
    } else if (!stream && tracksId.length > 0) {
      removeTrack(webrtc, tracksId);
    }
  }, [webrtc, stream, type, tracksId]);

  return tracksId;
}
