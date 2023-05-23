import React, { RefObject, useEffect, useRef, useState } from "react";
import clsx from "clsx";

export interface Props {
  videoStream: MediaStream | null;
  audioStream: MediaStream | null;
  flipHorizontally?: boolean;
  blockFillContent?: boolean;
}

const MediaPlayer: React.FC<Props> = ({ videoStream, audioStream, flipHorizontally, blockFillContent }: Props) => {
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
      const newValue = !blockFillContent && isVideoHorizontal(videoElement);
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
  }, [videoStream, fillContent, blockFillContent]);

  return (
    <>
      <audio autoPlay ref={audioRef} />
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
