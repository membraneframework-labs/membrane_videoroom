import { useEffect, useState } from "react";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import { TrackType } from "../../types";

export function useMediaStreamControl(type: TrackType, webrtc?: MembraneWebRTC, stream?: MediaStream): string | null {
  const [trackId, setTrackId] = useState<string | null>(null);

  // todo should I change it to useCallback?
  const addTrack = (webrtc: MembraneWebRTC, stream: MediaStream) => {
    const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();

    tracks.forEach((track, idx) => {
      const trackId: string = webrtc.addTrack(
        track,
        stream,
        { active: true, type: type },
        // todo handle screensharing and audio
        { enabled: true, active_encodings: ["l", "m", "h"] }
      );
      console.log({ name: "Track added", trackId, idx });
      // todo could be many tracks
      setTrackId(trackId);
    });
  };

  // todo should I change it to useCallback?
  const removeTrack = (webrtc: MembraneWebRTC, videoTrackId: string) => {
    setTrackId(null);
    webrtc.removeTrack(videoTrackId);
  };

  useEffect(() => {
    if (!webrtc) {
      return;
    }
    if (!trackId && stream) {
      addTrack(webrtc, stream);
    } else if (trackId && !stream) {
      removeTrack(webrtc, trackId);
    }
  }, [webrtc, trackId, stream]);

  return trackId;
}
