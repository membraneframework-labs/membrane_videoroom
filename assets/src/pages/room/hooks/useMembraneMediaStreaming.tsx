import { useCallback, useEffect, useState } from "react";
import { MembraneWebRTC } from "@membraneframework/membrane-webrtc-js";
import { TrackType } from "../../types";

export const useMembraneMediaStreaming = (
  type: TrackType,
  isConnected?: boolean,
  webrtc?: MembraneWebRTC,
  stream?: MediaStream
): string[] => {
  const [tracksId, setTracksId] = useState<string[]>([]);

  const addTrack = useCallback((type: TrackType, webrtc: MembraneWebRTC, stream: MediaStream) => {
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

  const removeTrack = useCallback((webrtc: MembraneWebRTC, trackIds: string[]) => {
    console.log("remove track");
    setTracksId([]);
    trackIds.forEach((trackId) => {
      webrtc.removeTrack(trackId);
    });
  }, []);

  useEffect(() => {
    if (!webrtc) {
      return;
    }

    // return;
    // console.log({ name: "useMembraneMediaStream", localPeer });

    if (stream && tracksId.length === 0 && isConnected) {
      addTrack(type, webrtc, stream);
    } else if (!stream && tracksId.length > 0 && isConnected) {
      removeTrack(webrtc, tracksId);
    }
  }, [webrtc, stream, type, isConnected, tracksId, removeTrack, addTrack]);

  return tracksId;
};
