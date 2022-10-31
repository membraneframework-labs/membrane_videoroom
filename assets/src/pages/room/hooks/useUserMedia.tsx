import { useCallback, useEffect, useState } from "react";

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

  const stopStream = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      isError: true,
      isSuccess: false,
      previewRef: undefined,
      stream: undefined,
      stop: () => {
        // empty
      },
    }));
  }, []);

  // todo fix audio track
  const startStream = useCallback((stream: MediaStream) => {
    setState((prevState) => {
      return {
        ...prevState,
        isError: false,
        isSuccess: true,
        stream: stream,
        stop: () => {
          stream.getTracks().forEach((track) => track.stop());
          // todo refactor
          setState((prevStateInner) => ({
            ...prevStateInner,
            stream: undefined,
          }));
        },
      };
    });
  }, []);

  const handleRevokePermission = useCallback(
    (stream: MediaStream) => {
      stream.getTracks().forEach((track) => {
        // onended fires up when:
        // - user clicks "Stop sharing" button
        // - user withdraws permission to camera
        track.onended = () => {
          stopStream();
        };
      });
    },
    [stopStream]
  );

  const getMedia = useCallback(() => {
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
      });
  }, [mediaStreamSupplier, handleRevokePermission, startStream, stopStream]);

  const [state, setState] = useState<UseMediaResult>({
    isError: false,
    isSuccess: true,
    start: getMedia,
    stream: undefined,
    stop: () => {
      // empty
    },
  });

  // todo extract to separate hook
  useEffect(() => {
    if (!config.startOnMount && firstMount) {
      setFirstMount(false);
      return;
    }
    getMedia();
    // remove this comment after extracting
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
