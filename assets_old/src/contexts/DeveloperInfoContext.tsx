import React, { useContext, useState } from "react";

export type DeveloperInfo = {
  simulcast: { status: boolean; setSimulcast: (status: boolean) => void };
  manualMode: { status: boolean; setManualMode: (status: boolean) => void };
  smartLayerSwitching: { status: boolean; setSmartLayerSwitching: (status: boolean) => void };
};

export const DeveloperInfoContext = React.createContext<DeveloperInfo | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export const DeveloperInfoProvider = ({ children }: Props) => {
  const [simulcast, setSimulcast] = useState<boolean>(false);
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [smartLayerSwitching, setSmartLayerSwitching] = useState<boolean>(false);

  return (
    <DeveloperInfoContext.Provider
      value={{
        simulcast: { status: simulcast, setSimulcast: setSimulcast },
        manualMode: { status: manualMode, setManualMode },
        smartLayerSwitching: { status: smartLayerSwitching, setSmartLayerSwitching },
      }}
    >
      {children}
    </DeveloperInfoContext.Provider>
  );
};

export const useDeveloperInfo = (): DeveloperInfo => {
  const context = useContext(DeveloperInfoContext);
  if (!context) throw new Error("useDeveloperInfo must be used within a DeveloperInfoProvider");
  return context;
};
