import { useEffect, useState } from "react";

export type UseMediaResult = {
  isError: boolean;
  isSuccess: boolean;
  start: () => void;
  stop: () => void;
  stream?: MediaStream;
};

type Config = {
  startOnMount: boolean;
};

const startOnMount = { startOnMount: false };

export const useUserMedia = (config: MediaStreamConstraints) =>
  useMedia(startOnMount, () => navigator.mediaDevices.getUserMedia(config));

export const useDisplayMedia = (config: DisplayMediaStreamConstraints) =>
  useMedia({ startOnMount: false }, () => navigator.mediaDevices.getDisplayMedia(config));

export function useMedia(config: Config, mediaStreamSupplier: () => Promise<MediaStream>): UseMediaResult {
  const [firstMount, setFirstMount] = useState(true);

  // todo should I change it to useCallback?
  const stopStream = () => {
    setState((prevState) => {
      return {
        ...prevState,
        isError: true,
        isSuccess: false,
        previewRef: undefined,
        stream: undefined,
        stop: () => {
          // empty
        },
      };
    });
  };

  // todo should I change it to useCallback?
  // todo fix audio track
  const startStream = (stream: MediaStream) => {
    setState((prevState) => {
      // console.log("State changing: stream: " + stream);
      return {
        ...prevState,
        isError: false,
        isSuccess: true,
        stream: stream,
        stop: () => {
          stream.getTracks().forEach((e) => e.stop());
          // todo refactor
          setState((prevStateInner) => ({
            ...prevStateInner,
            stream: undefined,
          }));
        },
      };
    });
  };

  // todo should I change it to useCallback?
  const handleRevokePermission = (stream: MediaStream) => {
    stream.getTracks().forEach((track) => {
      // onended fires up when:
      // - user clicks "Stop sharing" button
      // - user withdraws permission to camera
      track.onended = () => {
        stopStream();
        // console.log("On ended...");
      };
    });
  };

  // todo should I change it to useCallback?
  const getMedia = () => {
    mediaStreamSupplier()
      .then((stream: MediaStream) => {
        handleRevokePermission(stream);
        startStream(stream);
      })
      .catch((error) => {
        // this callback fires up when
        // - user didn't grant permission to camera
        // - user clicked "Cancel" instead of "Share" on Screen Sharing menu ("Chose what to share" in Google Chrome)
        stopStream();
        // console.log({ error });
      });
  };

  const [state, setState] = useState<UseMediaResult>({
    isError: false,
    isSuccess: true,
    start: getMedia,
    stream: undefined,
    stop: () => {
      // empty
    },
  });

  // startOnMount is only used for development
  useEffect(() => {
    if (!config.startOnMount && firstMount) {
      setFirstMount(false);
      return;
    }
    getMedia();
  }, []);

  return state;
}
