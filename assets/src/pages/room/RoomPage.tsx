import React, { FC, useEffect, useState } from "react";

import { useDisplayMedia, UseMediaResult, useUserMedia } from "./hooks/useUserMedia";
import { AUDIO_TRACK_CONSTRAINTS, SCREENSHARING_MEDIA_CONSTRAINTS, VIDEO_TRACK_CONSTRAINTS } from "./consts";
import { useMembraneClient } from "./hooks/useMembraneClient";
import MediaControlButtons from "./components/MediaControlButtons";
import { PeerMetadata, RemotePeer, usePeersState } from "./hooks/usePeerState";
import { useToggle } from "./hooks/useToggle";
import { VideochatSection } from "./VideochatSection";
import { getRandomAnimalEmoji } from "./utils";
import { useSomeHook } from "./hooks/useSomeHook";

type Props = {
  displayName: string;
  roomId: string;
  isSimulcastOn: boolean;
  manualMode: boolean;
};

export type SetErrorMessage = (value: string) => void;

const RoomPage: FC<Props> = ({ roomId, displayName, isSimulcastOn, manualMode }: Props) => {
  const mode = manualMode ? "manual" : "automatic";

  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [showSimulcastMenu, toggleSimulcastMenu] = useToggle(false);
  const [peerMetadata] = useState<PeerMetadata>({ emoji: getRandomAnimalEmoji(), displayName: displayName });

  const { state: peerState, api: peerApi } = usePeersState();
  const { webrtc } = useMembraneClient(roomId, peerMetadata, isSimulcastOn, peerApi, setErrorMessage);

  const userMediaVideo = useUserMedia(VIDEO_TRACK_CONSTRAINTS, false);
  const userMediaAudio: UseMediaResult = useUserMedia(AUDIO_TRACK_CONSTRAINTS, false);
  const displayMedia: UseMediaResult = useDisplayMedia(SCREENSHARING_MEDIA_CONSTRAINTS, false);

  const isConnected = !!peerState?.local?.id;

  const cameraStreaming = useSomeHook("camera", isConnected, webrtc, userMediaVideo, peerApi);
  const audioStreaming = useSomeHook("audio", isConnected, webrtc, userMediaVideo, peerApi);
  const screenSharingStreaming = useSomeHook("screensharing", isConnected, webrtc, userMediaVideo, peerApi);

  useEffect(() => {
    console.log({ name: "state", peerState });
  }, [peerState]);

  return (
    <section>
      <div className="flex flex-col h-screen relative">
        {errorMessage && (
          <div className="bg-red-700" style={{ height: "100px", width: "100%" }}>
            {errorMessage}
          </div>
        )}

        <section className="flex flex-col h-screen mb-14">
          <header className="p-4">
            <div className="flex items-center">
              <img src="/svg/logo_min.svg" className="hidden md:block h-8 mr-2" alt="Mini logo" />
              <h2 className="text-2xl md:text-4xl text-center font-bold text-white">Membrane WebRTC video room demo</h2>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Room {roomId}</h3>
            <h3 className="text-xl font-medium text-white">
              Participants{" "}
              <span>
                {peerMetadata.emoji} {peerMetadata.displayName}
              </span>
              {peerState.remote.map((peer: RemotePeer) => (
                <span key={peer.id} title={peer.id}>
                  {peer.emoji} {peer.displayName}
                </span>
              ))}
            </h3>
          </header>
          <VideochatSection
            peers={peerState.remote}
            localPeer={peerState.local}
            showSimulcast={showSimulcastMenu}
            webrtc={webrtc}
          />
        </section>
        <MediaControlButtons
          mode={mode}
          userMediaVideo={userMediaVideo}
          cameraStreaming={cameraStreaming}
          userMediaAudio={userMediaAudio}
          audioStreaming={audioStreaming}
          displayMedia={displayMedia}
          screenSharingStreaming={screenSharingStreaming}
        />
      </div>
      {isSimulcastOn && (
        <button
          onClick={toggleSimulcastMenu}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 md:right-2 md:-translate-x-1 md:left-auto bg-gray-700 hover:bg-gray-900 focus:ring ring-gray-800 focus:border-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-max"
          type="submit"
        >
          Show simulcast controls
        </button>
      )}
    </section>
  );
};

export default RoomPage;
