import React, { FC } from "react";
import { SimulcastReceivingEncoding } from "./SimulcastReceivingEncoding";
import { SimulcastEncodingToReceive } from "./SimulcastEncodingToReceive";
import { SimulcastQuality, UseSimulcastRemoteEncodingResult } from "../../../hooks/useSimulcastRemoteEncoding";

type Props = {
  remoteEncoding: UseSimulcastRemoteEncodingResult;
  changeRemoteEncoding: any;
  quality?: SimulcastQuality;
};

export const SimulcastRemoteLayer: FC<Props> = ({ remoteEncoding, changeRemoteEncoding, quality }: Props) => {
  return (
    <>
      <SimulcastReceivingEncoding quality={quality} />
      <SimulcastEncodingToReceive
        selectQuality={remoteEncoding.setQuality}
        changeRemoteEncoding={changeRemoteEncoding}
      />
    </>
  );
};
