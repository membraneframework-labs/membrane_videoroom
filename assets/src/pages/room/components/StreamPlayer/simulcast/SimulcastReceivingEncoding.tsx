import React, { FC } from "react";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";

type Props = {
  encoding?: TrackEncoding;
};

export const SimulcastReceivingEncoding: FC<Props> = ({ encoding }: Props) => (
  <div className="absolute right-0 top-0 z-50 bg-white p-2 text-sm text-brand-dark-gray/80 md:text-base">
    Encoding: {encoding}
  </div>
);
