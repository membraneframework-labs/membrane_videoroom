import { useCallback, useEffect, useState } from "react";
import noop from "../shared/utils/noop";

// TODO After some testing this hook should be extracted to browser-media-utils

export type UseMedia = {
  isError: boolean;
  stream: MediaStream | null;
  isLoading: boolean;
  start: () => void;
  stop: () => void;
  isEnabled: boolean;
  disable: () => void;
  enable: () => void;
};

const defaultState: UseMedia = {
  isError: false,
  stream: null,
  isLoading: false,
  start: noop,
  stop: noop,
  isEnabled: true,
  disable: noop,
  enable: noop,
};

const stopTracks = (stream: MediaStream) => {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
};

/**
 * Hook that returns media stream and methods to control it, depending on the passed method.
 *
 * @param getMedia - Promise that returns a promise with MediaStream
 * @returns object containing information about the media stream and methods to control it
 */
export const useMedia = (getMedia: (() => Promise<MediaStream>) | null): UseMedia => {
  const [state, setState] = useState<UseMedia>(defaultState);

  const start: (getMedia: () => Promise<MediaStream>) => Promise<MediaStream> = useCallback(
    (getMedia: () => Promise<MediaStream>) => {
      const setEnable = (stream: MediaStream, status: boolean) => {
        stream?.getTracks().forEach((track: MediaStreamTrack) => {
          track.enabled = status;
        });
        setState(
          (prevState: UseMedia): UseMedia => ({
            ...prevState,
            isEnabled: status,
          })
        );
      };

      setState((prevState) => ({ ...prevState, isLoading: true }));

      return getMedia()
        .then((mediasStream) => {
          const stop = () => {
            stopTracks(mediasStream);
            setState((prevState) => ({
              ...prevState,
              stop: noop,
              start: () => start(getMedia),
              stream: null,
              isEnabled: false,
              disable: noop,
              enable: noop,
            }));
          };

          setState((prevState: UseMedia) => {
            return {
              ...prevState,
              isLoading: false,
              stream: mediasStream,
              start: noop,
              stop: stop,
              disable: () => setEnable(mediasStream, false),
              enable: () => setEnable(mediasStream, true),
              isEnabled: true,
            };
          });
          return mediasStream;
        })
        .catch((e) => {
          setState((prevState) => ({
            ...prevState,
            isLoading: false,
            isError: true,
            isEnabled: false,
            disable: noop,
            enable: noop,
          }));
          return Promise.reject(e);
        });
    },
    []
  );

  useEffect(() => {
    if (!getMedia) return;
    const result: Promise<MediaStream> = start(getMedia);

    return () => {
      result.then((mediaStream) => {
        stopTracks(mediaStream);
        setState((prevState) => ({
          ...prevState,
          stop: noop,
          start: () => start(getMedia),
          stream: null,
        }));
      });
    };
  }, [getMedia, start]);

  return state;
};
