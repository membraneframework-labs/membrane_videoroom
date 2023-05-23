import { DeviceError } from "./type";

export const REQUESTING = { type: "Requesting" } as const;
export const NOT_REQUESTED = { type: "Not requested" } as const;
export const PERMISSION_DENIED: DeviceError = { name: "NotAllowedError" };
export const OVERCONSTRAINED_ERROR: DeviceError = { name: "OverconstrainedError" };
