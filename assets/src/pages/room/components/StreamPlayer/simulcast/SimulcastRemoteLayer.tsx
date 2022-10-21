import React, { FC } from "react";
import { SimulcastReceivingEncoding } from "./SimulcastReceivingEncoding";
import { SimulcastEncodingToReceive } from "./SimulcastEncodingToReceive";
import { UseSimulcastRemoteEncodingResult } from "../../../hooks/useSimulcastRemoteEncoding";

type Props = {
  remoteEncoding: UseSimulcastRemoteEncodingResult;
};

export const SimulcastRemoteLayer: FC<Props> = ({ remoteEncoding }: Props) => {
  return (
    <>
      <SimulcastReceivingEncoding quality={remoteEncoding.quality} />
      <SimulcastEncodingToReceive selectQuality={remoteEncoding.setQuality} />
    </>
  );
};
