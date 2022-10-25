import React, { FC } from "react";
import { TrackEncoding } from "@membraneframework/membrane-webrtc-js";

type Props = {
  encoding?: TrackEncoding;
};

export const SimulcastReceivingEncoding: FC<Props> = ({ encoding }: Props) => (
  <div className="absolute text-sm md:text-base text-gray-700 opacity-80 bg-white top-0 right-0 p-2 z-50">
    Encoding: {encoding}
  </div>
);
