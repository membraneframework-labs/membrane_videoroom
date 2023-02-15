import React, { FC } from "react";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { isTrackEncoding } from "../../../../types";

type Props = {
  setTargetEncoding: (encoding: TrackEncoding | null) => void;
  targetEncoding: TrackEncoding | null;
  userSelectedEncoding: TrackEncoding | null;
  disabled?: boolean;
};

export const SimulcastEncodingToReceive: FC<Props> = ({
  userSelectedEncoding,
  targetEncoding,
  setTargetEncoding,
  disabled,
}: Props) => {
  return (
    <div className="absolute bottom-0 right-0 z-50 bg-white p-2 text-sm text-gray-700 opacity-80 md:text-base">
      <div>Target: {targetEncoding}</div>
      <div>
        <label>Target cap: </label>
        <select
          disabled={disabled}
          value={userSelectedEncoding || undefined}
          onChange={(event) => {
            const value = event.target.value;
            if (!isTrackEncoding(value) && value !== "") return;
            setTargetEncoding(value === "" ? null : value);
          }}
        >
          <option value=""></option>
          <option value="h">High</option>
          <option value="m">Medium</option>
          <option value="l">Low</option>
        </select>
      </div>
    </div>
  );
};
