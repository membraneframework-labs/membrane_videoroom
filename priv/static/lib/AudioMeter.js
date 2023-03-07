/* eslint-disable no-undef */

// This is a worklet that is used to calculate the volume of the audio stream

const SMOOTHING_FACTOR = 0.99;

class AudioMeter extends AudioWorkletProcessor {

  constructor() {
    super();
    this.volume = 0;
    this.interval = 500;
    this.lastCall = 0;

    this.port.onmessage = (event) => {
      // Deal with message received from the main thread - event.data
      if (event.data.interval) {
        this.interval = event.data.interval;
      }
    };
  }

  process(inputs, outputs, parameters) {

    if (Date.now() - this.lastCall < this.interval) return true;

    const input = inputs[0];
    const samples = input[0];

    const sumSquare = samples.reduce((p, c) => p + (c * c), 0);
    const rms = Math.sqrt(sumSquare / (samples.length || 1));
    this.volume = Math.max(rms, this.volume * SMOOTHING_FACTOR);
    this.port.postMessage({ volume: this.volume });


    this.lastCall = Date.now();

    // Don't forget to return true - else worklet is ended
    return true;
  }
}

registerProcessor('audioMeter', AudioMeter);