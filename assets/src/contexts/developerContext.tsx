import React from "react";

export type SimulcastContextType = {
  simulcast: { status: boolean; setSimulcast: (status: boolean) => void };
  manualMode: { status: boolean; setManualMode: (status: boolean) => void };
};

export const DeveloperContext = React.createContext<SimulcastContextType>({
  simulcast: {
    status: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setSimulcast: () => {},
  },
  manualMode: {
    status: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setManualMode: () => {},
  },
});
