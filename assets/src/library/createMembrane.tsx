import React, { useContext, useEffect, useMemo, useState } from "react";
import { LibraryPeersState, Selector } from "./state.types";
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

    // useEffect(() => {
    //   console.log("Creating state!");
    //   setState((prevState) => ({
    //     ...prevState,
    //     connectivity: {
    //       ...prevState.connectivity,
    //       connect: connectFunction(setState),
    //     },
    //   }));
    // }, []);

    return <MembraneContext.Provider value={{ state, setState }}>{children}</MembraneContext.Provider>;
  };

  const useMembraneContext = (): MembraneContextType<PeerMetadataGeneric, TrackMetadataGeneric> => {
    // console.log("useMembraneContext")
    const context = useContext(MembraneContext);
    if (!context) throw new Error("useMembraneContext must be used within a MembraneContextProvider");
    return context;
  };


  // todo remove
  const useMembraneState = () => {
    const { state } = useMembraneContext();

    // useEffect(() => {
    //   console.log("Setting state!");
    //   setState((prevState) => ({
    //     ...prevState,
    //     connectivity: {
    //       ...prevState.connectivity,
    //       connect: connectFunction(setState),
    //     },
    //   }));
    // }, []);

    return state;
  };

  const useSelector = <Result,>(selector: Selector<PeerMetadataGeneric, TrackMetadataGeneric, Result>): Result => {
    const { state } = useMembraneContext();

    const result: Result = useMemo(() => {
      return selector(state);
    }, [selector, state]);

    return result;
  };

  const useConnect = (): ((
    roomId: string,
    peerMetadata: PeerMetadataGeneric,
    isSimulcastOn: boolean
  ) => () => void) => {
    const { setState }: MembraneContextType<PeerMetadataGeneric, TrackMetadataGeneric> = useMembraneContext();

    return useMemo(() => connectFunction(setState), []);
  };

  return {
    // MembraneContext,
    MembraneContextProvider,
    useMembraneContext,
    // useMembraneState,
    useSelector,
    useConnect,
  };
};
