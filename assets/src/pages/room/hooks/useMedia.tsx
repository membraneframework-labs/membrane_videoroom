import { useCallback, useEffect, useMemo, useState } from "react";

export type UseMediaResult = MediaState & MediaApi;

type MediaState = {
  isError: boolean;
  isSuccess: boolean;
  stream?: MediaStream;
  isEnabled: boolean;
};

export type MediaApi = {
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

export const useMediaDevice = (config: Config, mediaStreamSupplier: () => Promise<MediaStream>): UseMediaResult => {
  const [state, setState] = useState<MediaState>({
    isError: false,
    isSuccess: true,
    stream: undefined,
    isEnabled: false,
  });

  const [api, setApi] = useState<MediaApi>({
    start: () => {
      return;
    },
    stop: () => {
      return;
    },
    enable: () => {
      return;
    },
    disable: () => {
      return;
    },
  });

  // rename to clearState or sth
  const setErrorState = useCallback(() => {
    setState(
      (): MediaState => ({
        isError: true,
        isSuccess: false,
        stream: undefined,
        isEnabled: false,
      })
    );
  }, []);

  const setSuccessfulState = useCallback((stream: MediaStream) => {
    setState(
      (): MediaState => ({
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
      .catch(() => {
        // this callback fires up when
        // - user didn't grant permission to camera
        // - user clicked "Cancel" instead of "Share" on Screen Sharing menu ("Chose what to share" in Google Chrome)
        setErrorState();
        return Promise.reject();
      });
  }, [mediaStreamSupplier, setupTrackCallbacks, setSuccessfulState, setErrorState]); // todo add media stream supplier

  const setEnable = useCallback(
    (status: boolean) => {
      state.stream?.getTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = status;
      });
      setState(
        (prevState: MediaState): MediaState => ({
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
          stopTracks(stream);
        })
        .catch(() => {
          return;
        });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          return;
        },
        enable: () => setEnable(true),
        disable: () => setEnable(false),
      });
    } else {
      setApi({
        stop: () => {
          return;
        },
        start: () => {
          startStream();
        },
        enable: () => {
          return;
        },
        disable: () => {
          return;
        },
      });
    }
  }, [startStream, setEnable, state]);

  const result: UseMediaResult = useMemo(() => ({ ...api, ...state }), [api, state]);

  return result;
};

export class MediaStreamConfig {
  private type = "MediaStreamConfig";

  constructor(public constraints: MediaStreamConstraints) {
    this.constraints = constraints;
  }
}

export class DisplayMediaStreamConfig {
  private type = "DisplayMediaStreamConfig";

  constructor(public constraints: MediaStreamConstraints) {
    this.constraints = constraints;
  }
}

export const useMedia = (
  config: MediaStreamConfig | DisplayMediaStreamConfig,
  startOnMount = false
): UseMediaResult => {
  const mediaStreamSupplier = useCallback(() => {
    return config instanceof DisplayMediaStreamConfig
      ? navigator.mediaDevices.getDisplayMedia(config.constraints)
      : navigator.mediaDevices.getUserMedia(config.constraints);
  }, [config]);

  return useMediaDevice({ startOnMount }, mediaStreamSupplier);
};
