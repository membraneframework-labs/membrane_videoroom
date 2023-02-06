import React, { useContext, useEffect, useState } from "react";
import { LibraryPeersState } from "./state.types";
import { DEFAULT_STORE } from "./externalState";
import { connectFunction } from "./connectFunction";

type Props = {
  children: React.ReactNode;
};

type MembraneContextType<PeerMetadataGeneric, TrackMetadataGeneric> = {
  state: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>;
  setState: (
    value:
      | ((
          prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>
        ) => LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>)
      | LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>
  ) => void;
};

export const createMembrane = <PeerMetadataGeneric, TrackMetadataGeneric>() => {
  const MembraneContext = React.createContext<
    MembraneContextType<PeerMetadataGeneric, TrackMetadataGeneric> | undefined
  >(undefined);

  const MembraneContextProvider = ({ children }: Props) => {
    const [state, setState] = useState<LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>>(DEFAULT_STORE);

    return <MembraneContext.Provider value={{ state, setState }}>{children}</MembraneContext.Provider>;
  };

  const useMembraneContext = (): MembraneContextType<PeerMetadataGeneric, TrackMetadataGeneric> => {
    // console.log("useMembraneContext")
    const context = useContext(MembraneContext);
    if (!context) throw new Error("useMembraneContext must be used within a MembraneContextProvider");
    return context;
  };

  const useMembraneClient = () => {
    const { state, setState } = useMembraneContext();

    useEffect(() => {
      console.log("Setting state!");
      setState((prevState) => ({
        ...prevState,
        connectivity: {
          ...prevState.connectivity,
          connect: connectFunction(setState),
        },
      }));
    }, []);

    return state;
  };

  return {
    MembraneContext,
    MembraneContextProvider,
    useMembraneContext,
    useMembraneClient,
  };
};
