import { useEffect, useState } from "react";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";

export function useMediaStreamControl(
  type: "screensharing" | "camera",
  userId?: string,
  webrtc?: MembraneWebRTC,
  stream?: MediaStream
) {
  const [videoTrackId, setVideoTrackId] = useState<string | null>(null);

  const addTrack = (webrtc: MembraneWebRTC, userId: string, stream: MediaStream) => {
    console.log("Adding track")
    stream.getTracks().forEach((track, idx) => {
      const trackId = webrtc.addTrack(
        track,
        stream,
        { active: true, type: type },
        { enabled: false, active_encodings: ["l", "m", "h"] }
      )!!;

      setVideoTrackId(trackId);
    });
  };

  const removeTrack = (webrtc: MembraneWebRTC, videoTrackId: string) => {
    setVideoTrackId(null);
    webrtc.removeTrack(videoTrackId);
  };

  useEffect(() => {
    if (!userId || !webrtc) {
      return;
    }
    if (!videoTrackId && stream) {
      addTrack(webrtc, userId, stream);
    } else if (videoTrackId && !stream) {
      removeTrack(webrtc, videoTrackId);
    }
  }, [userId, webrtc, videoTrackId, stream]);
}
