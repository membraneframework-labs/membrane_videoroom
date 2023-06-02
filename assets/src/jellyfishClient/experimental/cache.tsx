import type { State } from "../state.types";

const s = (value: any) =>
  JSON.stringify(value, (k, v) => {
    if (typeof v === "bigint") return v.toString();
    return v;
  });
/**
 * Create a cache for a result of a function
 *
 * @param isEqual - function that compares two values
 * @param callbackFunction - function that returns a value
 * @returns cached function
 */
export const cache = <Result, PeerMetadata, TrackMetadata>(
  isEqual: (value: any, other: any) => boolean,
  callbackFunction: (snapshot: State<PeerMetadata, TrackMetadata>) => Result
): ((snapshot: State<PeerMetadata, TrackMetadata>) => Result) => {
  // console.log("%c Create cache", "color: orange");
  // console.log({ name: "New invoke! cache is empty" });

  let cache: any = undefined;

  return (innerSnapshot) => {
    const result = callbackFunction(innerSnapshot);

    const isStateEqual = isEqual(cache, result);
    // console.log({ cache, result });

    if (isStateEqual) {
      // console.log("%c Return cache", "color: green");
      // console.log(`%c ${s(cache)}`, "color: green");
      return cache;
    }
    // console.log(`%c ${s(cache)} nie rowna sie ${s(result)}`, "color: red");
    // console.log("%c Return new", "color: red");

    // console.log({ name: "Setting cache to", result });
    cache = result;

    return cache;
  };
};
