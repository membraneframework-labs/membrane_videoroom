import { useEffect, useState } from "react";

export const useAudioMeterWorklet = (stream?: MediaStream, intervalMs = 500) => {
  const [audioNode, setAudioNode] = useState<AudioWorkletNode>();
  const [audioLevel, setAudioLevel] = useState(-Infinity);

  useEffect(() => {
    if (!stream) return;

    // Create the Audio Context
    const audioContext = new AudioContext({ latencyHint: intervalMs / 1000 });

    const source = audioContext.createMediaStreamSource(stream);

    let node: AudioWorkletNode;
    // Load the worklet
    audioContext.audioWorklet.addModule("/lib/AudioMeter.js").then(() => {
      node = new AudioWorkletNode(audioContext, "audioMeter");

      node.port.postMessage({ interval: intervalMs });

      node.port.onmessage = (event) => {
        // Deal with message received from the Worklet processor - event.data
        setAudioLevel(event.data);
      };

      // Connect the audio pipeline - this will start the processing
      source.connect(node).connect(audioContext.destination);

      setAudioNode((prev) => {
        if (prev) {
          prev.disconnect();
          prev.port.close();
        }
        return node;
      });

      return () => {
        if (!node) return;
        node.disconnect();
        node.port.close();
      };
    });
    // ignore change of interval duration - we don't want to restart the worklet
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  useEffect(() => {
    audioNode?.port.postMessage({ interval: intervalMs });
  }, [audioNode?.port, intervalMs]);

  return { audioNode, audioLevel };
};
