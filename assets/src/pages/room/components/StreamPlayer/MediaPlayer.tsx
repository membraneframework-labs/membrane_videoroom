import React, { RefObject, useEffect, useRef } from "react";
import clsx from "clsx";

export interface Props {
  flipHorizontally?: boolean;
  videoStream?: MediaStream;
  audioStream?: MediaStream;
  playAudio?: boolean;
}

const MediaPlayer: React.FC<Props> = ({ videoStream, audioStream, flipHorizontally, playAudio }: Props) => {
  const videoRef: RefObject<HTMLVideoElement> = useRef<HTMLVideoElement>(null);
  const audioRef: RefObject<HTMLAudioElement> = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = videoStream || null;
  }, [videoStream]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.srcObject = audioStream || null;
  }, [audioStream]);

  return (
    <>
      <audio muted={!playAudio} autoPlay ref={audioRef} />
      <video
        className={clsx("w-full h-full", flipHorizontally && "flip-horizontally")}
        autoPlay
        playsInline
        controls={false}
        muted
        ref={videoRef}
      />
    </>
  );
};

export default MediaPlayer;
