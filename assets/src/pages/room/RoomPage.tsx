import React, { FC, useContext, useState } from "react";

import { useDisplayMedia, UseMediaResult, useUserMedia } from "./hooks/useUserMedia";
import { AUDIO_TRACK_CONSTRAINTS, SCREENSHARING_MEDIA_CONSTRAINTS, VIDEO_TRACK_CONSTRAINTS } from "./consts";
import { useMediaStreamControl } from "./hooks/useMediaStreamControl";
import { useMembraneClient } from "./hooks/useMembraneClient";
import MediaControlButtons from "./components/MediaControlButtons";
import { LocalPeer, usePeersState } from "./hooks/usePeerState";
import VideoPeerPlayers, { MediaStreamWithMetadata } from "./components/VideoPeerPlayers";
import ScreenSharingPlayers from "./components/ScreenSharingPlayers";

type Props = {
  displayName: string;
  roomId: string;
  isSimulcastOn: boolean;
};

const RoomPage: FC<Props> = ({ roomId, displayName, isSimulcastOn }: Props) => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // useAskForPermission()
  const userMediaVideo: UseMediaResult = useUserMedia(VIDEO_TRACK_CONSTRAINTS);
  const userMediaAudio: UseMediaResult = useUserMedia(AUDIO_TRACK_CONSTRAINTS);
  const displayMedia: UseMediaResult = useDisplayMedia(SCREENSHARING_MEDIA_CONSTRAINTS);

  const { peers, addPeers, removePeer, addTrack, removeTrack } = usePeersState();
  const { webrtc, currentUser } = useMembraneClient(
    roomId,
    displayName,
    isSimulcastOn,
    addPeers,
    removePeer,
    addTrack,
    removeTrack,
    setErrorMessage
  );

  const userCameraStreamId = useMediaStreamControl("camera", webrtc, userMediaVideo.stream);
  const userScreenSharingStreamId = useMediaStreamControl("screensharing", webrtc, displayMedia.stream);

  console.log({ peers });

  const localStreams: MediaStreamWithMetadata = {
    peerId: "Me",
    displayName: "Me",
    emoji: currentUser?.emoji,
    videoId: userCameraStreamId || undefined,
    videoStream: userMediaVideo.stream,
    audioId: userMediaAudio.stream ? "Me (audio)" : undefined,
    audioStream: userMediaAudio.stream,
    screenSharingStream: displayMedia.stream,
  };

  return (
    <section className="phx-hero">
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
            <h3 className="text-2xl font-semibold text-white mb-2">Room {roomId}</h3>
            <h3 className="text-xl font-medium text-white">
              Participants
              <span title={localStreams.videoId}> {displayName}</span>
              {Object.values(peers)?.map((e: LocalPeer) => (
                <span key={e.id} title={e.id}>
                  {e.displayName}
                </span>
              ))}
            </h3>
          </header>
          <div
            id="videochat-error"
            className="flex items-center justify-center h-full px-4 text-white font-bold text-center text-4xl"
            style={{ display: "none" }}
          ></div>

          <div id="videochat" className="px-2 md:px-20 overflow-y-auto">
            <div className="flex flex-col items-center md:flex-row md:items-start justify-center h-full">
              <ScreenSharingPlayers peers={peers} videoStream={displayMedia.stream} />
              <VideoPeerPlayers peers={peers} localUser={localStreams} />
            </div>
          </div>
        </section>
        <MediaControlButtons
          userMediaAudio={userMediaAudio}
          userMediaVideo={userMediaVideo}
          displayMedia={displayMedia}
        />
      </div>
    </section>
  );
};

export default RoomPage;
