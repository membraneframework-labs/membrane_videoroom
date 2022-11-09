import { AUDIO_TRACK_CONSTRAINTS, VIDEO_TRACK_CONSTRAINTS } from "./consts";

export async function getVideoStream(): Promise<MediaStream> {
  return await getMedia(VIDEO_TRACK_CONSTRAINTS, "videoinput");
}

export async function getAudioStream(): Promise<MediaStream> {
  return await getMedia(AUDIO_TRACK_CONSTRAINTS, "audioinput");
}

async function getMedia(
  track_constraints: MediaTrackConstraints,
  type: "audioinput" | "videoinput"
): Promise<MediaStream> {
  const constraints = {
    audio: type === "audioinput" ? track_constraints : false,
    video: type === "videoinput" ? track_constraints : false,
  };

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (_exception) {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
      (device) => device.kind === type
    );

    for (let device of devices) {
      try {
        track_constraints.deviceId = { exact: device.deviceId };
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

  throw new Error("No input devices are available");
}
