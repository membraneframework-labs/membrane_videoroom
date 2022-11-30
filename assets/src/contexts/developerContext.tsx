import React from "react";

export type SimulcastContextType = {
  simulcast: { status: boolean; setSimulcast: (status: boolean) => void };
  manualMode: { status: boolean; setManualMode: (status: boolean) => void };
  cameraAutostart: { status: boolean; setCameraAutostart: (status: boolean) => void };
};

export const DeveloperContext = React.createContext<SimulcastContextType>({
  simulcast: {
    status: false,
    setSimulcast: () => {
      return;
    },
  },
  manualMode: {
    status: false,
    setManualMode: () => {
      return;
    },
  },
  cameraAutostart: {
    status: false,
    setCameraAutostart: () => {
      return;
    },
  },
});
