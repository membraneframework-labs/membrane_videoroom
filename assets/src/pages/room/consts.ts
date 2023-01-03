import { DisplayMediaStreamConfig, MediaStreamConfig } from "./hooks/useMedia";

const AUDIO_TRACK_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    advanced: [{ autoGainControl: true }, { noiseSuppression: true }, { echoCancellation: true }],
  },
};

const VIDEO_TRACK_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: {
      max: 1280,
      ideal: 1280,
      min: 640,
    },
    height: {
      max: 720,
      ideal: 720,
      min: 320,
    },
    frameRate: {
      max: 30,
      ideal: 24,
    },
  },
};

const SCREENSHARING_MEDIA_CONSTRAINTS: DisplayMediaStreamConstraints = {
  video: {
    frameRate: { ideal: 10, max: 15 },
  },
};
export const VIDEO_TRACKS_CONFIG = new MediaStreamConfig(VIDEO_TRACK_CONSTRAINTS);
export const AUDIO_TRACKS_CONFIG = new MediaStreamConfig(AUDIO_TRACK_CONSTRAINTS);
export const SCREEN_SHARING_TRACKS_CONFIG = new DisplayMediaStreamConfig(SCREENSHARING_MEDIA_CONSTRAINTS);

export const LOCAL_PEER_NAME = "Me"
export const LOCAL_VIDEO_ID = "LOCAL_VIDEO_ID"
export const LOCAL_SCREEN_SHARING_ID = "LOCAL_SCREEN_SHARING_ID"

export const DEFAULT_AUTOSTART_CAMERA_AND_MICROPHONE_CHECKBOX_VALUE = true;
export const DEFAULT_MANUAL_MODE_CHECKBOX_VALUE = false;

// todo implement
const MBps = 1024 * 8;

export const BANDWIDTH_LIMITS = {
  video: 10 * MBps,
  audio: 1 * MBps,
};
