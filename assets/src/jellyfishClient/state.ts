import { State } from "./state.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DEFAULT_STORE: State<any, any> = {
  local: null,
  remote: {},
  status: null,
  bandwidthEstimation: BigInt(0), // todo investigate bigint n notation
  connectivity: {
    api: null,
    client: null,
  },
};
