import React, { FC } from "react";
import { UseSimulcastLocalEncoding } from "../../../hooks/useSimulcastSend";

type Props = {
  localEncoding: UseSimulcastLocalEncoding;
  disabled?: boolean;
};

export const SimulcastEncodingToSend: FC<Props> = ({ localEncoding, disabled }: Props) => {
  const { highQuality, toggleHighQuality, mediumQuality, toggleMediumQuality, lowQuality, toggleLowQuality } =
    localEncoding;

  return (
    <div className="absolute text-sm md:text-base text-gray-700 opacity-80 bg-white bottom-0 right-0 p-2 z-50">
      <label>Encodings to send</label>
      <ul>
        <li>
          <input
            disabled={disabled}
            type="checkbox"
            name="h"
            checked={highQuality}
            onChange={toggleHighQuality}
          />
          High
        </li>
        <li>
          <input
            disabled={disabled}
            type="checkbox"
            name="m"
            checked={mediumQuality}
            onChange={toggleMediumQuality}
          />
          Medium
        </li>
        <li>
          <input
            disabled={disabled}
            type="checkbox"
            name="l"
            checked={lowQuality}
            onChange={toggleLowQuality}
          />
          Low
        </li>
      </ul>
    </div>
  );
};
