import React, { RefObject, useEffect, useRef } from "react";

type Metadata = {
  topLeft?: string;
  topRight?: string;
  bottomLeft?: string;
  bottomRight?: string;
};

export interface Props {
  peerId: string;
  videoStream?: MediaStream;
  audioStream?: MediaStream;
  metadata?: Metadata;
}

const VideoPlayer: React.FC<Props> = ({ peerId, videoStream, audioStream, metadata }: Props) => {
  const videoRef: RefObject<HTMLVideoElement> = useRef<HTMLVideoElement>(null);
  const audioRef: RefObject<HTMLAudioElement> = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    console.log("-Video hook start");
    if (!videoRef.current) return;
    console.log("-Video hook assigment");
    videoRef.current.srcObject = videoStream || null;
  }, [videoStream]);

  useEffect(() => {
    console.log("-Audio hook start");
    if (!audioRef.current) return;
    console.log("-Audio hook assigment");
    audioRef.current.srcObject = audioStream || null;
  }, [audioStream]);

  return (
    <div
      data-name="video-feed"
      className="relative bg-gray-900 shadow rounded-md overflow-hidden h-full w-full aspect-video"
    >
      <audio autoPlay ref={audioRef}></audio>
      <video
        className="w-full h-full"
        autoPlay // 1
        playsInline
        controls={false}
        muted // 1
        ref={videoRef}
      ></video>
      {metadata?.topLeft && (
        <div data-name="video-label" className="absolute text-white text-shadow-lg top-0 left-0 p-2">
          {metadata.topLeft}
        </div>
      )}
      {metadata?.topRight && (
        <div data-name="video-label" className="absolute text-white text-shadow-lg top-0 right-0 p-2">
          {metadata.topRight}
        </div>
      )}
      {metadata?.bottomLeft && (
        <div data-name="video-label" className="absolute text-white text-shadow-lg bottom-0 left-0 p-2">
          {metadata.bottomLeft}
        </div>
      )}
      {metadata?.bottomRight && (
        <div data-name="video-label" className="absolute text-white text-shadow-lg bottom-0 right-0 p-2">
          {metadata.bottomRight}
        </div>
      )}
      <div
        data-name="no-video-msg"
        className="invisible absolute text-white w-full h-full top-0 left-0"
        style={{ textAlign: "center" }}
      >
        Camera turned off
      </div>
    </div>
  );
};

// 1. autoplay onLoad - play() failed when video is not muted and user didn't interact with the page
// from chrome console: play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD
// https://stackoverflow.com/questions/49930680/how-to-handle-uncaught-in-promise-domexception-play-failed-because-the-use

export default VideoPlayer;
