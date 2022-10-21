import React, { FC } from "react";

type Props = {
  quality: "l" | "m" | "h";
};

export const SimulcastReceivingEncoding: FC<Props> = ({ quality }: Props) => (
  <div className="absolute text-sm md:text-base text-gray-700 opacity-80 bg-white top-0 right-0 p-2 z-50">
    Encoding: {quality}
  </div>
);
