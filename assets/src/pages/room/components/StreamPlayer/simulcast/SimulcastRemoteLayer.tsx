import React, { FC } from "react";
import { SimulcastReceivingEncoding } from "./SimulcastReceivingEncoding";
import { SimulcastEncodingToReceive } from "./SimulcastEncodingToReceive";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";

type Props = {
  setDesiredEncoding: (encoding: TrackEncoding) => void;
  currentEncoding?: TrackEncoding;
  desiredEncoding?: TrackEncoding;
  disabled?: boolean;
};

export const SimulcastRemoteLayer: FC<Props> = ({
  currentEncoding,
  desiredEncoding,
  setDesiredEncoding,
  disabled,
}: Props) => {
  return (
    <>
      <SimulcastReceivingEncoding encoding={currentEncoding} />
      <SimulcastEncodingToReceive
        desiredEncoding={desiredEncoding}
        setDesiredEncoding={setDesiredEncoding}
        disabled={disabled}
      />
    </>
  );
};
