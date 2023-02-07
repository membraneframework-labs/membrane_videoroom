import React, { useContext, useMemo, useState } from "react";
import type { LibraryPeersState, Selector } from "./state.types";
import { DEFAULT_STORE } from "./externalState/externalState";
import { connect } from "./connect";

type Props = {
  children: React.ReactNode;
};

type MembraneContextType<PeerMetadataGeneric, TrackMetadataGeneric> = {
  state: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>;
  setState: (
    value: (
      prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>
    ) => LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>
  ) => void;
  // setState: (
  //   value:
  //     | ((
  //     prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>
  //   ) => LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>)
  //     | LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>
  // ) => void;
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
    const context = useContext(MembraneContext);
    if (!context) throw new Error("useMembraneContext must be used within a MembraneContextProvider");
    return context;
  };

  const useSelector = <Result,>(selector: Selector<PeerMetadataGeneric, TrackMetadataGeneric, Result>): Result => {
    const { state } = useMembraneContext();

    return useMemo(() => selector(state), [selector, state]);
  };

  type UseConnect = (roomId: string, peerMetadata: PeerMetadataGeneric, isSimulcastOn: boolean) => () => void;

  const useConnect = (): UseConnect => {
    const { setState }: MembraneContextType<PeerMetadataGeneric, TrackMetadataGeneric> = useMembraneContext();

    return useMemo(() => {
      console.log("%cMemo!!", "color: red")
      return connect(setState);
    }, [setState]);
  };

  return {
    MembraneContextProvider,
    useSelector,
    useConnect,
  };
};
