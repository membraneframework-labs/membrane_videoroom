import { useCallback, useEffect, useRef, useState } from "react";
import { useEffectOnMountAsync } from "./useEffectOnMountAsync";

export type UseMediaResult = {
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  start: () => void;
  stop: () => void;
  stream?: MediaStream;
  stoppingRef: () => void;
};

type Config = {
  startOnMount: boolean;
};

export const useMedia = (config: Config, mediaStreamSupplier: () => Promise<MediaStream>): UseMediaResult => {
  const isLoadingRef = useRef(false);

  const stoppingRef = useRef<() => void>(() => {
    // console.log("Default stopping ref value");
  });

  const stopStream = useCallback(() => {
    isLoadingRef.current = false;
    setState(
      (prevState): UseMediaResult => ({
        ...prevState,
        isError: true,
        isSuccess: false,
        stream: undefined,
        isLoading: false,
        stop: () => {
          // empty
        },
        stoppingRef: stoppingRef.current,
      })
    );
  }, []);

  // todo fix audio track
  const startStream = useCallback((stream: MediaStream) => {
    isLoadingRef.current = false;
    stoppingRef.current = () => {
      // console.log("Stopping from new stopMethod");
      stream.getTracks().forEach((track) => {
        // console.log({ name: "Stopping track", track });
        track.stop();
      });
      setState((prevStateInner) => ({
        ...prevStateInner,
        stream: undefined,
        isLoading: false,
        stoppingRef: stoppingRef.current,
      }));
    };

    setState((prevState) => {
      return {
        ...prevState,
        isError: false,
        isSuccess: true,
        stream: stream,
        isLoading: false,
        stoppingRef: stoppingRef.current,
        stop: () => {
          // console.log("Stopping from old stop method");
          stream.getTracks().forEach((track) => track.stop());
          // todo refactor
          setState((prevStateInner) => ({
            ...prevStateInner,
            stream: undefined,
            isLoading: false,
            stoppingRef: stoppingRef.current,
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
    const someObject: { closeFunction: undefined | (() => void) } = {
      closeFunction: undefined,
    };
    isLoadingRef.current = true;
    setState((prevState) => ({ ...prevState, isLoading: true }));
    mediaStreamSupplier()
      .then((stream: MediaStream) => {
        someObject.closeFunction = () => {
          console.log("Closing");
          stream.getTracks().forEach((track) => track.stop());
        };
        console.log("1");
        handleRevokePermission(stream);
        startStream(stream);
      })
      .catch((error) => {
        console.log("2");
        // this callback fires up when
        // - user didn't grant permission to camera
        // - user clicked "Cancel" instead of "Share" on Screen Sharing menu ("Chose what to share" in Google Chrome)
        stopStream();
      });

    return someObject;
  }, [mediaStreamSupplier, handleRevokePermission, startStream, stopStream]);

  const [state, setState] = useState<UseMediaResult>({
    isError: false,
    isSuccess: true,
    start: getMedia,
    stream: undefined,
    isLoading: false,
    stop: () => {
      // empty
    },
    stoppingRef: stoppingRef.current,
  });
  // todo extract to separate hook
  useEffectOnMountAsync(true, () => {
    return getMedia();
  });

  return state;
};

const useUserMediaConfig = { startOnMount: false };

export const useUserMedia = (config: MediaStreamConstraints, startOnMount = false) =>
  useMedia({ startOnMount }, () => navigator.mediaDevices.getUserMedia(config));

export const useDisplayMedia = (config: DisplayMediaStreamConstraints) =>
  useMedia(useUserMediaConfig, () => navigator.mediaDevices.getDisplayMedia(config));
