import React, { FC, useState } from "react";

import { useDisplayMedia, UseMediaResult, useUserMedia } from "./hooks/useUserMedia";
import { AUDIO_TRACK_CONSTRAINTS, SCREENSHARING_MEDIA_CONSTRAINTS, VIDEO_TRACK_CONSTRAINTS } from "./consts";
import { useMediaStreamControl } from "./hooks/useMediaStreamControl";
import { useMembraneClient } from "./hooks/useMembraneClient";
import MediaControlButtons from "./components/MediaControlButtons";
import { usePeersState } from "./hooks/usePeerState";
import VideoPeerPlayers from "./components/VideoPeerPlayers";
import ScreenSharingPlayers from "./components/ScreenSharingPlayers";
import { useMatches, useNavigate } from "react-router-dom";

const useRoomId = () => {
  const navigation = useMatches();
  return navigation[0].params?.roomId;
};

const RoomPage: FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const roomId = useRoomId();
  // useAskForPermission()
  const userMediaVideo: UseMediaResult = useUserMedia(VIDEO_TRACK_CONSTRAINTS);
  const userMediaAudio: UseMediaResult = useUserMedia(AUDIO_TRACK_CONSTRAINTS);
  const displayMedia: UseMediaResult = useDisplayMedia(SCREENSHARING_MEDIA_CONSTRAINTS);

  const { peers, addPeers, removePeer, addTrack, removeTrack } = usePeersState();
  const { userId, webrtc } = useMembraneClient(roomId, addPeers, removePeer, addTrack, removeTrack, setErrorMessage);

  useMediaStreamControl("camera", userId, webrtc, userMediaVideo.stream);
  useMediaStreamControl("screensharing", userId, webrtc, displayMedia.stream);

  console.log({ peers });

  return (
    <div id="room" className="flex flex-col h-screen relative">
      {errorMessage && (
        <div className="bg-red-700" style={{ height: "100px", width: "100%" }}>
          {errorMessage}
        </div>
      )}
      <section className="flex flex-col h-screen mb-14">
        <header className="p-4">
          <div className="flex items-center">
            <img src="/svg/logo_min.svg" className="hidden md:block h-8 mr-2" />
            <h2 className="text-2xl md:text-4xl text-center font-bold text-white">Membrane WebRTC video room demo</h2>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">Id: {userId}</h3>
          <h3 className="text-2xl font-semibold text-white mb-2">
            Peers in room:{" "}
            {Object.values(peers)?.map((e: any) => (
              <span key={e.id}>{e.id}</span>
            ))}
          </h3>
          <h3 className="text-2xl font-semibold text-white mb-2">RoomPage: </h3>
          <div id="participants-list" className="text-xl font-medium text-white"></div>
        </header>
        <div
          id="videochat-error"
          className="flex items-center justify-center h-full px-4 text-white font-bold text-center text-4xl"
          style={{ display: "none" }}
        ></div>

        <div id="videochat" className="px-2 md:px-20 overflow-y-auto">
          <div className="flex flex-col items-center md:flex-row md:items-start justify-center h-full">
            <ScreenSharingPlayers peers={peers} videoStream={displayMedia.stream} />
            <VideoPeerPlayers
              peers={peers}
              videoStream={userMediaVideo.stream}
              audioStream={userMediaAudio.stream}
              screenSharingStream={displayMedia.stream}
            />
          </div>
        </div>
      </section>
      <MediaControlButtons
        userMediaAudio={userMediaAudio}
        userMediaVideo={userMediaVideo}
        displayMedia={displayMedia}
      />
    </div>
  );
};

export default RoomPage;
