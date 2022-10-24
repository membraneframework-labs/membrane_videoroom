import React, { FC } from "react";
import { SimulcastQuality } from "../../../hooks/useSimulcastRemoteEncoding";

type Props = {
  selectQuality: (quality: SimulcastQuality) => void;
  changeRemoteEncoding: any;
};

export const SimulcastEncodingToReceive: FC<Props> = ({ selectQuality, changeRemoteEncoding }: Props) => {
  return (
    <div className="absolute text-sm md:text-base text-gray-700 opacity-80 bg-white bottom-0 right-0 p-2 z-50">
      <label>Encoding to receive</label>
      <select
        name="video-encoding-select"
        onChange={(e) => {
          console.log("onChange");
          console.log(e.target.value);
          const value = e.target.value;
          const okValues = ["l", "m", "h"];
          if (okValues.includes(value)) {
            changeRemoteEncoding(value)
            selectQuality(value as SimulcastQuality);
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
