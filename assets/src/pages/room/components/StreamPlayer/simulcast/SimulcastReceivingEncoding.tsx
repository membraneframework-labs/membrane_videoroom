import React, { FC } from "react";
import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";

type Props = {
  encoding?: TrackEncoding;
};

export const SimulcastReceivingEncoding: FC<Props> = ({ encoding }: Props) => (
  <div className="absolute top-0 right-0 z-50 bg-white p-2 text-sm text-gray-700 opacity-80 md:text-base">
    Encoding: {encoding}
  </div>
);
