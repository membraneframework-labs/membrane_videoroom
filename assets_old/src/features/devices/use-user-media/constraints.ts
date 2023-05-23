export const toMediaTrackConstraints = (
  constraint?: boolean | MediaTrackConstraints
): MediaTrackConstraints | undefined => {
  if (typeof constraint === "boolean") {
    return constraint ? {} : undefined;
  }
  return constraint;
};

export const prepareMediaTrackConstraints = (
  deviceId: string | undefined,
  constraints: MediaTrackConstraints | undefined
): MediaTrackConstraints | boolean => {
  if (!deviceId) return false;
  const exactId: Pick<MediaTrackConstraints, "deviceId"> = deviceId ? { deviceId: { exact: deviceId } } : {};
  return { ...constraints, ...exactId };
};

export const getExactDeviceConstraint = (
  videoConstraints: MediaTrackConstraints | undefined,
  deviceId: string | undefined
) => ({
  ...videoConstraints,
  deviceId: { exact: deviceId },
});

export const prepareConstraints = (
  shouldAskForDevice: boolean,
  deviceIdToStart: string | undefined,
  constraints: MediaTrackConstraints | undefined
): MediaTrackConstraints | undefined | boolean => {
  if (!shouldAskForDevice) return false;

  return deviceIdToStart ? getExactDeviceConstraint(constraints, deviceIdToStart) : constraints;
};

export const removeExact = (
  trackConstraints: boolean | MediaTrackConstraints | undefined
): boolean | MediaTrackConstraints | undefined => {
  if (trackConstraints === undefined || trackConstraints === true || trackConstraints === false)
    return trackConstraints;
  const copy: MediaTrackConstraints = { ...trackConstraints };
  delete copy["deviceId"];
  return copy;
};
