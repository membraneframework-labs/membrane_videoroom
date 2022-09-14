import { AUDIO_TRACK_CONSTRAINTS, VIDEO_TRACK_CONSTRAINTS } from "./consts";

export async function getVideoStream(
  deviceId: string | undefined = undefined
): Promise<MediaStream> {
  const constraints = {
    video: {
      ...VIDEO_TRACK_CONSTRAINTS,
      deviceId: deviceId ? { exact: deviceId } : undefined,
    },
  };

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (exception) {
    console.warn(exception);
    if (deviceId) throw exception;

    const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
      (device) => device.kind === "videoinput"
    );

    for (let device of devices) {
      try {
        constraints.video.deviceId = { exact: device.deviceId };
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        console.error(
          "Failed to acquire a stream from deviceID ",
          device.deviceId,
          " due to ",
          error
        );
      }
    }
  }

  return Promise.reject(new Error("No input devices are available"));
}

export async function getAudioStream(): Promise<MediaStream> {
  // TODO: this should probably follow the same flow as `getVideoStream`
  return await navigator.mediaDevices.getUserMedia({
    audio: AUDIO_TRACK_CONSTRAINTS,
  });
}

async function listDevices(): Promise<MediaDeviceInfo[]> {
  const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
    (device) => device.deviceId
  );

  if (devices.length == 0)
    throw "There are no input devices or permissions were not granted";
  return devices;
}

export async function listVideoDevices(): Promise<MediaDeviceInfo[]> {
  return (await listDevices()).filter((device) => device.kind === "videoinput");
}
