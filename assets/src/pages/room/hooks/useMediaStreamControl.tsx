import { useEffect, useState } from "react";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";

export function useMediaStreamControl(type: "screensharing" | "camera", webrtc?: MembraneWebRTC, stream?: MediaStream) {
  const [videoTrackId, setVideoTrackId] = useState<string | null>(null);

  const addTrack = (webrtc: MembraneWebRTC, stream: MediaStream) => {
    console.log("Adding track");
    stream.getTracks().forEach((track, idx) => {
      const trackId = webrtc.addTrack(
        track,
        stream,
        { active: true, type: type },
        { enabled: false, active_encodings: ["l", "m", "h"] }
      )!!;

      // todo could be many tracks
      setVideoTrackId(trackId);
    });
  };

  const removeTrack = (webrtc: MembraneWebRTC, videoTrackId: string) => {
    setVideoTrackId(null);
    webrtc.removeTrack(videoTrackId);
  };

  useEffect(() => {
    if (!webrtc) {
      return;
    }
    if (!videoTrackId && stream) {
      addTrack(webrtc, stream);
    } else if (videoTrackId && !stream) {
      removeTrack(webrtc, videoTrackId);
    }
  }, [webrtc, videoTrackId, stream]);
}
