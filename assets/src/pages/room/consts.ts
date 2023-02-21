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

const SCREENSHARING_MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    frameRate: { ideal: 20, max: 25 },
    width: { max: 1920, ideal: 1920 },
    height: { max: 1080, ideal: 1080 },
  },
};
export const VIDEO_TRACKS_CONFIG = new MediaStreamConfig(VIDEO_TRACK_CONSTRAINTS);
export const AUDIO_TRACKS_CONFIG = new MediaStreamConfig(AUDIO_TRACK_CONSTRAINTS);
export const SCREEN_SHARING_TRACKS_CONFIG = new DisplayMediaStreamConfig(SCREENSHARING_MEDIA_CONSTRAINTS);

export const LOCAL_PEER_NAME = "You";
export const LOCAL_VIDEO_ID = "LOCAL_VIDEO_ID";
export const LOCAL_SCREEN_SHARING_ID = "LOCAL_SCREEN_SHARING_ID";

export const DEFAULT_AUTOSTART_CAMERA_VALUE = true;
export const DEFAULT_AUTOSTART_MICROPHONE_VALUE = true;
export const DEFAULT_MANUAL_MODE_CHECKBOX_VALUE = false;
export const DEFAULT_SMART_LAYER_SWITCHING_VALUE = true;

export const MAX_TILE_HEIGHT_FOR_MEDIUM_ENCODING = 600;
export const MAX_TILE_HEIGHT_FOR_LOW_ENCODING = 250;
export const VIDEO_TILE_RESIZE_DETECTOR_DEBOUNCE_VALUE = 1000; // milliseconds
