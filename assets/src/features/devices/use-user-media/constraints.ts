import { log } from "./debug";

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

export const getExactConstraints = (
  shouldAskForVideo: boolean,
  videoConstraints: MediaTrackConstraints | undefined,
  previousVideoDevice: MediaDeviceInfo | null,
  shouldAskForAudio: boolean,
  audioConstraints: MediaTrackConstraints | undefined,
  previousAudioDevice: MediaDeviceInfo | null
): MediaStreamConstraints => ({
  video: shouldAskForVideo && {
    ...videoConstraints,
    deviceId: { exact: previousVideoDevice?.deviceId },
  },
  audio: shouldAskForAudio && {
    ...audioConstraints,
    deviceId: { exact: previousAudioDevice?.deviceId },
  },
});

const prepareConstraints = (
  shouldAskForDevice: boolean,
  deviceIdToStart: string | undefined,
  videoConstraints: MediaTrackConstraints | undefined
): MediaTrackConstraints | undefined | boolean => {
  if (!shouldAskForDevice) return false;

  return deviceIdToStart ? { ...videoConstraints, deviceId: { exact: deviceIdToStart } } : videoConstraints;
};

export const getExactConstraintsIfPossible = (
  shouldAskForVideo: boolean,
  videoIdToStart: string | undefined,
  videoConstraints: MediaTrackConstraints | undefined,
  shouldAskForAudio: boolean,
  audioIdToStart: string | undefined,
  audioConstraints: MediaTrackConstraints | undefined
) => {
  log({
    shouldAskForVideo,
    videoIdToStart,
    videoConstraints,
    shouldAskForAudio,
    audioIdToStart,
    audioConstraints,
  });

  return {
    video: prepareConstraints(shouldAskForVideo, videoIdToStart, videoConstraints),
    audio: prepareConstraints(shouldAskForAudio, audioIdToStart, audioConstraints),
  };
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
