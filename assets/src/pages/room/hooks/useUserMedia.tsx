import { useCallback, useEffect, useState } from "react";

export type UseMediaResult = {
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  start: () => void;
  stop: () => void;
  stream?: MediaStream;
};

type Config = {
  startOnMount: boolean;
};

const stopTracks = (stream: MediaStream) => {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
};

export const useMedia = (config: Config, mediaStreamSupplier: () => Promise<MediaStream>): UseMediaResult => {
  // rename to clearState or sth
  const setEmptyState = useCallback(() => {
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
      })
    );
  }, []);

  const startStream = useCallback((stream: MediaStream) => {
    setState((prevState) => {
      return {
        ...prevState,
        isError: false,
        isSuccess: true,
        stream: stream,
        isLoading: false,
        stop: () => {
          stream.getTracks().forEach((track) => track.stop());
          // todo refactor
          setState((prevStateInner) => ({
            ...prevStateInner,
            stream: undefined,
            isLoading: false,
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
          setEmptyState();
        };
      });
    },
    [setEmptyState]
  );

  const getMedia = useCallback((): Promise<MediaStream> => {
    return mediaStreamSupplier()
      .then((stream: MediaStream) => {
        handleRevokePermission(stream);
        startStream(stream);
        return stream;
      })
      .catch((error) => {
        console.log("Catch in got media");
        // this callback fires up when
        // - user didn't grant permission to camera
        // - user clicked "Cancel" instead of "Share" on Screen Sharing menu ("Chose what to share" in Google Chrome)
        setEmptyState();
        return Promise.reject();
      });
  }, [mediaStreamSupplier, handleRevokePermission, startStream, setEmptyState]);

  const [state, setState] = useState<UseMediaResult>({
    isError: false,
    isSuccess: true,
    start: getMedia,
    stream: undefined,
    isLoading: false,
    stop: () => {
      // empty
    },
  });

  const setEnable = useCallback(
    (status: boolean) => {
      state.stream?.getTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = status;
      });
    },
    [state.stream]
  );

  useEffect(() => {
    if (!config.startOnMount) return;

    const promise = getMedia();
    return () => {
      promise
        .then((stream) => {
          console.log("Closing stream");
          stopTracks(stream);
        })
        .catch(() => {
          console.log("Catching stream");
        });
    };
  }, []);

  return state;
};

export const useUserMedia = (config: MediaStreamConstraints, startOnMount = false) =>
  useMedia({ startOnMount }, () => navigator.mediaDevices.getUserMedia(config));

export const useDisplayMedia = (config: DisplayMediaStreamConstraints, startOnMount = true) =>
  useMedia({ startOnMount }, () => navigator.mediaDevices.getDisplayMedia(config));
