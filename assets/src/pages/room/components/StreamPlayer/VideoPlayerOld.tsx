import React, { RefObject, useEffect, useRef } from "react";
import { SimulcastPlayerConfig } from "./VideoPeerPlayersSection";
import { SimulcastReceivingEncoding } from "./simulcast/SimulcastReceivingEncoding";

type Metadata = {
  topLeft?: string;
  topRight?: string;
  bottomLeft?: string;
  bottomRight?: string;
};

export interface Props {
  videoStream?: MediaStream;
  audioStream?: MediaStream;
  simulcast?: SimulcastPlayerConfig;
  topLeft?: JSX.Element;
  topRight?: JSX.Element;
  bottomLeft?: JSX.Element;
  bottomRight?: JSX.Element;
}

// todo remove
const VideoPlayerOld: React.FC<Props> = ({
  videoStream,
  audioStream,
  simulcast,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}: Props) => {
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
      {topLeft && (
        <div data-name="video-label" className="absolute text-white text-shadow-lg top-0 left-0 p-2">
          {topLeft}
        </div>
      )}
      {topRight && (
        <div data-name="video-label" className="absolute text-white text-shadow-lg top-0 right-0 p-2">
          {topRight}
        </div>
      )}
      {bottomLeft && (
        <div data-name="video-label" className="absolute text-white text-shadow-lg bottom-0 left-0 p-2">
          {bottomLeft}
        </div>
      )}

      {/*{bottomRight && (*/}
      {/*  <div data-name="video-label" className="absolute text-white text-shadow-lg bottom-0 right-0 p-2">*/}
      {/*    {bottomRight}*/}
      {/*  </div>*/}

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

export default VideoPlayerOld;
