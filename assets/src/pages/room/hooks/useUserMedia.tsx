import { useCallback, useEffect, useMemo, useState } from "react";

export type UseMediaResult = State & Api;

type State = {
  isError: boolean;
  isSuccess: boolean;
  stream?: MediaStream;
  isEnabled: boolean;
};

export type Api = {
  start: () => void;
  stop: () => void;
  enable: () => void;
  disable: () => void;
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
  const [state, setState] = useState<State>({
    isError: false,
    isSuccess: true,
    stream: undefined,
    isEnabled: false,
  });

  const [api, setApi] = useState<Api>({
    start: () => {},
    stop: () => {},
    enable: () => {},
    disable: () => {},
  });

  // rename to clearState or sth
  const setErrorState = useCallback(() => {
    setState(
      (): State => ({
        isError: true,
        isSuccess: false,
        stream: undefined,
        isEnabled: false,
      })
    );
  }, []);

  const setSuccessfulState = useCallback((stream: MediaStream) => {
    setState(
      (): State => ({
        isError: false,
        isSuccess: true,
        stream: stream,
        isEnabled: true,
      })
    );
  }, []);

  const setupTrackCallbacks = useCallback(
    (stream: MediaStream) => {
      stream.getTracks().forEach((track) => {
        // onended fires up when:
        // - user clicks "Stop sharing" button
        // - user withdraws permission to camera
        track.onended = () => {
          setErrorState();
        };
      });
    },
    [setErrorState]
  );

  const startStream = useCallback((): Promise<MediaStream> => {
    return mediaStreamSupplier()
      .then((stream: MediaStream) => {
        setupTrackCallbacks(stream);
        setSuccessfulState(stream);
        return stream;
      })
      .catch((error) => {
        console.log("Catch in got media");
        // this callback fires up when
        // - user didn't grant permission to camera
        // - user clicked "Cancel" instead of "Share" on Screen Sharing menu ("Chose what to share" in Google Chrome)
        setErrorState();
        return Promise.reject();
      });
  }, [mediaStreamSupplier, setupTrackCallbacks, setSuccessfulState, setErrorState]); // todo add media stream supplier

  const setEnable = useCallback(
    (status: boolean) => {
      console.log("Activation / deactivating");
      state.stream?.getTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = status;
      });
      setState(
        (prevState: State): State => ({
          ...prevState,
          isEnabled: status,
        })
      );
    },
    [state.stream, setState] // todo
  );

  useEffect(() => {
    if (!config.startOnMount) return;

    const promise = startStream();
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

  useEffect(() => {
    const stream = state.stream;

    if (stream) {
      setApi({
        stop: () => {
          stopTracks(stream);
          // todo refactor
          setState((prevStateInner) => ({
            ...prevStateInner,
            isError: false,
            isSuccess: true,
            stream: undefined,
            isEnabled: false,
          }));
        },
        start: () => {
          console.log("Stream already started");
        },
        enable: () => setEnable(true),
        disable: () => setEnable(false),
      });
    } else {
      setApi({
        stop: () => {
          console.log("There is no stream");
        },
        start: () => {
          startStream();
        },
        enable: () => {
          console.log("There is no stream");
        },
        disable: () => {
          console.log("There is no stream");
        },
      });
    }
  }, [startStream, setEnable, state]);

  const result: UseMediaResult = useMemo(() => ({ ...api, ...state }), [api, state]);

  return result;
};

export const useUserMedia = (config: MediaStreamConstraints, startOnMount = false) => {
  const mediaStreamSupplier = useCallback(() => navigator.mediaDevices.getUserMedia(config), []);

  return useMedia({ startOnMount }, mediaStreamSupplier);
};

export const useDisplayMedia = (config: DisplayMediaStreamConstraints, startOnMount = true) => {
  const mediaStreamSupplier = useCallback(() => navigator.mediaDevices.getDisplayMedia(config), [config]);

  return useMedia({ startOnMount }, mediaStreamSupplier);
};
