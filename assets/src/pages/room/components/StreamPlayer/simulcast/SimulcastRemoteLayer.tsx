import type { FC } from "react";
import React from "react";
import { SimulcastReceivingEncoding } from "./SimulcastReceivingEncoding";
import { SimulcastEncodingToReceive } from "./SimulcastEncodingToReceive";
import type { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";

type Props = {
  setDesiredEncoding: (encoding: TrackEncoding) => void;
  currentEncoding: TrackEncoding | null;
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
