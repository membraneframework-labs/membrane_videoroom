import React, { FC } from "react";
import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";

type Props = {
  setDesiredEncoding: (encoding: TrackEncoding) => void;
  desiredEncoding?: TrackEncoding;
  disabled?: boolean;
};

export const SimulcastEncodingToReceive: FC<Props> = ({ desiredEncoding, setDesiredEncoding, disabled }: Props) => {
  return (
    <div className="absolute text-sm md:text-base text-gray-700 opacity-80 bg-white bottom-0 right-0 p-2 z-50">
      <label>Encoding to receive</label>
      <select
        disabled={disabled}
        name="video-encoding-select"
        value={desiredEncoding}
        onChange={(e) => {
          const value = e.target.value;
          const okValues = ["l", "m", "h"];
          if (okValues.includes(value)) {
            setDesiredEncoding(value as TrackEncoding);
          }
        }}
      >
        <option value="h">High</option>
        <option value="m">Medium</option>
        <option value="l">Low</option>
      </select>
    </div>
  );
};
