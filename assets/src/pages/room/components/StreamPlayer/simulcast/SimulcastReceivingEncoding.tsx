import type { FC } from "react";
import React from "react";
import type { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";

type Props = {
  encoding: TrackEncoding | null;
};

export const SimulcastReceivingEncoding: FC<Props> = ({ encoding }: Props) => (
  <div className="absolute top-0 right-0 z-50 bg-white p-2 text-sm text-gray-700 opacity-80 md:text-base">
    Encoding: {encoding}
  </div>
);
