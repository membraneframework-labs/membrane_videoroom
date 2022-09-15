import { AUDIO_TRACK_CONSTRAINTS, VIDEO_TRACK_CONSTRAINTS } from "./consts";

export async function openDevice(
  type: "audio" | "video",
  deviceId: string | undefined = undefined
): Promise<MediaStream> {
  const deviceIdConstraint = deviceId ? { exact: deviceId } : undefined;
  let constraints;

  if (type === "video") {
    constraints = {
      video: {
        ...VIDEO_TRACK_CONSTRAINTS,
        deviceId: deviceIdConstraint,
      },
    };
  } else if (type === "audio") {
    constraints = {
      audio: {
        ...AUDIO_TRACK_CONSTRAINTS,
        deviceId: deviceIdConstraint,
      },
    };
  } else {
    throw `${type} doesn't describe proper device type. Use either 'audio' or 'video'`;
  }

  return await navigator.mediaDevices.getUserMedia(constraints);
}

export async function openDefaultDevice(
  type: "audio" | "video"
): Promise<MediaStream> {
  if (!["audio", "video"].includes(type))
    throw `${type} doesn't describe proper device type. Use either 'audio' or 'video'`;

  try {
    return await openDevice(type);
  } catch {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
      (device) => device.kind === type + "input"
    );

    for (let device of devices) {
      try {
        return await openDevice(type, device.deviceId);
      } catch {}
    }
  }

  return Promise.reject("No MediaDevices are available");
}

export async function listDevices(
  type: "audio" | "video" | undefined = undefined
): Promise<MediaDeviceInfo[]> {
  let devices = await navigator.mediaDevices.enumerateDevices();

  if (type) {
    devices = devices.filter((device) => device.kind === type + "input");
  }

  if (devices.length == 0)
    throw "There are no input devices or permissions were not granted";

  return devices;
}

export async function initializeDevices(): Promise<{
  audio: MediaStream;
  video: MediaStream;
}> {
  const constraints = {
    audio: AUDIO_TRACK_CONSTRAINTS,
    video: VIDEO_TRACK_CONSTRAINTS,
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    return {
      audio: new MediaStream(stream.getAudioTracks()),
      video: new MediaStream(stream.getVideoTracks()),
    };
  } catch (exception) {
    console.error("Opening devices failed due to ", exception);

    return {
      audio: await openDefaultDevice("audio"),
      video: await openDefaultDevice("video"),
    };
  }
}
