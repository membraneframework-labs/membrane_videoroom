import React, { useContext, useState } from "react";
import { LibraryPeersState } from "./state.types";
import { DEFAULT_STORE } from "./externalState";

export type UserContextType = {
  state: string | null;
  setState: (name: string) => void;
};

const UserContext = React.createContext<LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric> | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export const UserProvider = <PeerMetadataGeneric, TrackMetadataGeneric>({ children }: Props) => {
  const [state, setState] = useState<LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>>(DEFAULT_STORE);

  return <UserContext.Provider value={{ username, setUsername }}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
