import { State } from "./state.types";

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
