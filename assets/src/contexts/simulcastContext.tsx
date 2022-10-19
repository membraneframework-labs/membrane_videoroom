import React from "react";

export type SimulcastContextType = {
  simulcast: boolean;
  setSimulcast: (value: boolean) => void;
};

export const SimulcastContext = React.createContext<SimulcastContextType>({
  simulcast: false,
  setSimulcast: () => {},
});
