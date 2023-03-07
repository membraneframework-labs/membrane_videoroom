// hook inspired by https://www.webrtc-developers.com/how-to-know-if-my-microphone-works/

import { useEffect, useRef, useState } from "react";

export const useAudioMeterMain = (stream?: MediaStream, intervalMs = 500) => {
  const audioRef = useRef({ peakDB: -Infinity, level: 0 });
  const [analyzer, setAnalyzer] = useState<AnalyserNode>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const [isSoundDetected, setIsSoundDetected] = useState(false);

  useEffect(() => {
    if (!stream) return;

    // Create and configure the audio pipeline
    const audioContext = new AudioContext();
    const analyzerNode = audioContext.createAnalyser();
    analyzerNode.fftSize = 1024;
    analyzerNode.smoothingTimeConstant = 0.1;
    const sourceNode = audioContext.createMediaStreamSource(stream);
    sourceNode.connect(analyzerNode);
    setAnalyzer(analyzerNode);

    return () => {
      if (analyzerNode) analyzerNode.disconnect();
    };
  }, [stream]);

  useEffect(() => {
    if (!analyzer) return;

    const checkIfSoundDetected = () => {
      return audioRef.current.peakDB > -50;
    };

    // Analyze the sound
    intervalRef.current = setInterval(() => {
      // Compute the max volume level (-Infinity...0)
      const fftBins = new Float32Array(analyzer.frequencyBinCount); // Number of values manipulated for each sample
      analyzer.getFloatFrequencyData(fftBins);
      // peakDB varies from -Infinity up to 0
      const peakDB = Math.max(...fftBins);

      // Compute a wave (0...)
      const frequencyRangeData = new Uint8Array(analyzer.frequencyBinCount);
      analyzer.getByteFrequencyData(frequencyRangeData);
      const sum = frequencyRangeData.reduce((p, c) => p + c, 0);
      // level varies from 0 to 10
      const level = Math.sqrt(sum / frequencyRangeData.length);

      audioRef.current = { peakDB, level };

      setIsSoundDetected(checkIfSoundDetected());
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [analyzer, intervalMs]);

  return { audioRef, isSoundDetected };
};
