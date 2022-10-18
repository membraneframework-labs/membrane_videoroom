import React, { FC, useState } from "react";

import { useDisplayMedia, UseMediaResult, useUserMedia } from "./hooks/useUserMedia";
import { AUDIO_TRACK_CONSTRAINTS, SCREENSHARING_MEDIA_CONSTRAINTS, VIDEO_TRACK_CONSTRAINTS } from "./consts";
import VideoPlayer from "./components/VideoPlayer";
import { useMediaStreamControl } from "./hooks/useMediaStreamControl";
import { useMembraneClient } from "./hooks/useMembraneClient";
import MediaControlButtons from "./components/MediaControlButtons";
import { Peers, Track, usePeersState } from "./hooks/usePeerState";
import VideoPlayers from "./components/VideoPlayers";

export type MediaStreamWithMetadata = {
  peerId: string;
  videoId?: string;
  videoStream?: MediaStream;
  audioId?: string;
  audioStream?: MediaStream;
  screenSharingStream?: MediaStream;
};

const prepareScreenSharingStreams = (
  peers: Peers,
  localStream?: MediaStream
): { screenSharingStreams: MediaStreamWithMetadata[]; isScreenSharingActive: boolean } => {
  const peersScreenSharingTracks: MediaStreamWithMetadata[] = Object.values(peers)
    .flatMap((peer) => peer.tracks.map((track) => ({ peerId: peer.id, track: track })))
    .filter((e) => e.track?.metadata?.type === "screensharing")
    // todo fix now - should videoId be e.track?.trackId?
    .map((e) => ({ videoStream: e.track.mediaStream, peerId: e.peerId, videoId: e.track?.mediaStreamTrack?.id }));

  const screenSharingStreams: MediaStreamWithMetadata[] = localStream
    ? [{ videoStream: localStream, peerId: "(Me) screen", videoId: "(Me) screen" }, ...peersScreenSharingTracks]
    : peersScreenSharingTracks;

  const isScreenSharingActive: boolean = screenSharingStreams.length > 0;
  return { screenSharingStreams, isScreenSharingActive };
};

const RoomPage: FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  // useAskForPermission()
  const userMediaVideo: UseMediaResult = useUserMedia(VIDEO_TRACK_CONSTRAINTS);
  const userMediaAudio: UseMediaResult = useUserMedia(AUDIO_TRACK_CONSTRAINTS);
  const displayMedia: UseMediaResult = useDisplayMedia(SCREENSHARING_MEDIA_CONSTRAINTS);

  const { peers, addPeers, removePeer, addTrack, removeTrack } = usePeersState();
  const { userId, webrtc } = useMembraneClient(addPeers, setErrorMessage, removePeer, addTrack, removeTrack);

  useMediaStreamControl("camera", userId, webrtc, userMediaVideo.stream);
  useMediaStreamControl("screensharing", userId, webrtc, displayMedia.stream);

  const { screenSharingStreams, isScreenSharingActive } = prepareScreenSharingStreams(peers, displayMedia.stream);

  console.log({ peers });

  const localUserCameraStream: MediaStreamWithMetadata = {
    peerId: "Me",
    videoId: userMediaVideo.stream ? "Me (video)" : undefined,
    videoStream: userMediaVideo.stream,
    audioId: userMediaAudio.stream ? "Me (audio)" : undefined,
    audioStream: userMediaAudio.stream,
    screenSharingStream: displayMedia.stream,
  };

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
            {isScreenSharingActive && (
              <div
                id="screensharings-grid"
                className="h-full mb-3 md:mr-3 md:mb-none active-screensharing-grid grid-cols-1 md:grid-cols-1"
              >
                {screenSharingStreams.map((e) => (
                  <VideoPlayer
                    key={e.peerId + ":" + e.videoId}
                    peerId={e.peerId}
                    videoStream={e.videoStream}
                    metadata={{ bottomLeft: e.peerId }}
                  />
                ))}
              </div>
            )}
            <div
              id="videos-grid"
              className="grid flex-1 grid-flow-row gap-4 justify-items-center h-full grid-cols-1 md:grid-cols-2"
            >
              <VideoPlayers peers={peers} localStreams={localUserCameraStream} />
            </div>
          </div>
        </div>
      </section>
      <MediaControlButtons userMediaAudio={userMediaAudio} userMediaVideo={userMediaVideo} displayMedia={displayMedia} />
    </div>
  );
};

export default RoomPage;
