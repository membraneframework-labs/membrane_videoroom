import React, { RefObject, useEffect, useRef } from "react";
import clsx from "clsx";

export interface Props {
  flipHorizontally?: boolean;
  videoStream?: MediaStream;
  audioStream?: MediaStream;
  playAudio?: boolean;
  vadStatus?: "speech" | "silence"
}

const MediaPlayer: React.FC<Props> = ({ videoStream, audioStream, flipHorizontally, playAudio, vadStatus }: Props) => {
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
      <audio muted={!playAudio} autoPlay ref={audioRef}></audio>
      <video
        className={clsx("w-full h-full", flipHorizontally && "flip-horizontally", vadStatus === "speech" && "border-white border-4")}
        autoPlay
        playsInline
        controls={false}
        muted
        ref={videoRef}
      ></video>
    </>
  );
};

export default MediaPlayer;
