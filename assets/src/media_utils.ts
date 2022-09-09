import { AUDIO_TRACK_CONSTRAINTS, VIDEO_TRACK_CONSTRAINTS } from "./consts";

export async function getVideoStream(): Promise<MediaStream> {
  const constraints = {
    video: VIDEO_TRACK_CONSTRAINTS,
  };

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (_exception) {
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
