import React, { FC } from "react";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { isTrackEncoding } from "../../../../types";
import Button from "../../../../../features/shared/components/Button";

type Props = {
  setUserSelectedEncoding: (encoding: TrackEncoding) => void;
  setTargetEncoding: (encoding: TrackEncoding) => void;
  targetEncoding: TrackEncoding | null;
  userSelectedEncoding: TrackEncoding | "auto";
  disabled?: boolean;
};

type LayerButtonProps = {
  text: string;
  onClick: () => void;
};

const LayerButton = ({ onClick, text }: LayerButtonProps) => (
  <Button
    onClick={onClick}
    className="mx-0.5 flex w-[26px] items-center justify-center rounded-full rounded-full border disabled:pointer-events-none"
  >
    {text}
  </Button>
);

export const SimulcastEncodingToReceive: FC<Props> = ({
  userSelectedEncoding,
  targetEncoding,
  setUserSelectedEncoding,
  setTargetEncoding,
  disabled,
}: Props) => {
  return (
    <div className="absolute bottom-0 right-0 z-50 bg-white p-2 text-sm text-gray-700 opacity-80 md:text-base">
      <div className="flex flex-row justify-between">
        <div>Target: {targetEncoding}</div>
        <div className="flex flex-row">
          <LayerButton text="L" onClick={() => setTargetEncoding("l")} />
          <LayerButton text="M" onClick={() => setTargetEncoding("m")} />
          <LayerButton text="H" onClick={() => setTargetEncoding("h")} />
        </div>
      </div>
      <div>
        <label>Target limit: </label>
        <select
          disabled={disabled}
          value={userSelectedEncoding || undefined}
          onChange={(event) => {
            const value = event.target.value;
            if (isTrackEncoding(value)) {
              setUserSelectedEncoding(value);
            }
          }}
        >
          <option value="h">High</option>
          <option value="m">Medium</option>
          <option value="l">Low</option>
        </select>
      </div>
    </div>
  );
};
