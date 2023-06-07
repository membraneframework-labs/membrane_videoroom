import type { State } from "../state.types";

/**
 * Create a cache for a result of a function
 *
 * @param isEqual - function that compares two values
 * @param callbackFunction - function that returns a value
 * @returns cached function
 */
export const cache = <Result, PeerMetadata, TrackMetadata>(
  isEqual: (value: unknown, other: unknown) => boolean,
  callbackFunction: (snapshot: State<PeerMetadata, TrackMetadata>) => Result
): ((snapshot: State<PeerMetadata, TrackMetadata>) => Result) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cache: any = undefined;

  return (innerSnapshot) => {
    const result = callbackFunction(innerSnapshot);

    const isStateEqual = isEqual(cache, result);

    if (isStateEqual) {
      return cache;
    }
    cache = result;

    return cache;
  };
};
