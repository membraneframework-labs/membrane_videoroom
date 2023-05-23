import { CurrentDevices, DeviceError } from "./type";
import { OVERCONSTRAINED_ERROR, PERMISSION_DENIED } from "./constants";

export const deviceUtils = (mediaDeviceInfo: MediaDeviceInfo) =>
  mediaDeviceInfo.label !== "" && mediaDeviceInfo.deviceId !== "";

export const isVideo = (device: MediaDeviceInfo) => device.kind === "videoinput";

export const isAudio = (device: MediaDeviceInfo) => device.kind === "audioinput";

export const getDeviceInfo = (trackDeviceId: string | null, devices: MediaDeviceInfo[]): MediaDeviceInfo | null =>
  trackDeviceId ? devices.find(({ deviceId }) => trackDeviceId === deviceId) || null : null;

export const getCurrentDevicesSettings = (
  requestedDevices: MediaStream,
  mediaDeviceInfos: MediaDeviceInfo[]
): CurrentDevices => {
  const currentDevices: CurrentDevices = { videoinput: null, audioinput: null };

  requestedDevices.getTracks().forEach((track) => {
    const settings = track.getSettings();
    if (settings.deviceId) {
      const currentDevice = mediaDeviceInfos.find((device) => device.deviceId == settings.deviceId);
      const kind = currentDevice?.kind || null;
      if ((currentDevice && kind && kind === "videoinput") || kind === "audioinput") {
        currentDevices[kind] = currentDevice || null;
      }
    }
  });
  return currentDevices;
};
// todo remove export
export const isDeviceDifferentFromLastSession = (
  lastDevice: MediaDeviceInfo | null,
  currentDevice: MediaDeviceInfo | null
) => lastDevice && (currentDevice?.deviceId !== lastDevice.deviceId || currentDevice?.label !== lastDevice?.label);

export const isAnyDeviceDifferentFromLastSession = (
  lastVideoDevice: MediaDeviceInfo | null,
  lastAudioDevice: MediaDeviceInfo | null,
  currentDevices: CurrentDevices | null
): boolean =>
  !!(
    (currentDevices?.videoinput &&
      isDeviceDifferentFromLastSession(lastVideoDevice, currentDevices?.videoinput || null)) ||
    (currentDevices?.audioinput &&
      isDeviceDifferentFromLastSession(lastAudioDevice, currentDevices?.audioinput || null))
  );

// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#exceptions
// OverconstrainedError has higher priority than NotAllowedError
export const parseError = (error: unknown): DeviceError | null => {
  if (error && typeof error === "object" && "name" in error) {
    if (error.name === "NotAllowedError") {
      return PERMISSION_DENIED;
    } else if (error.name === "OverconstrainedError") {
      return OVERCONSTRAINED_ERROR;
    }
  }
  // todo handle unknown error
  return null;
};

export const enumerateDevices: () => Promise<MediaDeviceInfo[]> = async () =>
  await navigator.mediaDevices.enumerateDevices();
