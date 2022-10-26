import React, { RefObject, useEffect, useRef } from "react";
import clsx from "clsx";

export interface Props {
  flipHorizontally?: boolean;
  videoStream?: MediaStream;
  audioStream?: MediaStream;
}

const MediaPlayer: React.FC<Props> = ({ videoStream, audioStream, flipHorizontally }: Props) => {
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
    <>
      <audio autoPlay ref={audioRef}></audio>
      <video
        className={clsx("w-full h-full", flipHorizontally && "flip-horizontally")}
        autoPlay // 1
        playsInline
        controls={false}
        muted // 1
        ref={videoRef}
      ></video>
    </>
  );
};

// 1. autoplay onLoad - play() failed when video is not muted and user didn't interact with the page
// from chrome console: play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD
// https://stackoverflow.com/questions/49930680/how-to-handle-uncaught-in-promise-domexception-play-failed-because-the-use

export default MediaPlayer;
