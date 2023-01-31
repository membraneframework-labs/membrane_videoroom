import React, { RefObject, useEffect, useRef, useState } from "react";
import clsx from "clsx";

export interface Props {
  flipHorizontally?: boolean;
  videoStream?: MediaStream;
  audioStream?: MediaStream;
  playAudio?: boolean;
  screenShare?: boolean;
}

const MediaPlayer: React.FC<Props> = ({
  videoStream,
  audioStream,
  flipHorizontally,
  playAudio,
  screenShare,
}: Props) => {
  const videoRef: RefObject<HTMLVideoElement> = useRef<HTMLVideoElement>(null);
  const audioRef: RefObject<HTMLAudioElement> = useRef<HTMLAudioElement>(null);

  const [fillContent, shouldFillContent] = useState<boolean>(true);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = videoStream || null;
  }, [videoStream]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.srcObject = audioStream || null;
  }, [audioStream]);

  useEffect(() => {
    const isVideoHorizontal = (video: HTMLVideoElement): boolean => {
      const width = video.videoWidth;
      const height = video.videoHeight;

      return width > height;
    };

    const setFillContentState = (videoElement: HTMLVideoElement): void => {
      const newValue = isVideoHorizontal(videoElement) && !screenShare;
      shouldFillContent(newValue);
    };

    const video = videoRef.current;
    if (video) {
      video.onresize = () => {
        const videoElement = video;
        if (videoElement) setFillContentState(videoElement);
      };
    }

    return () => {
      if (video) video.onresize = null;
    };
  }, [videoStream, fillContent, screenShare]);

  return (
    <>
      <audio muted={!playAudio} autoPlay ref={audioRef} />
      <video
        className={clsx(
          "h-full w-full",
          flipHorizontally && "flip-horizontally",
          fillContent ? "object-cover" : "object-contain"
        )}
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
