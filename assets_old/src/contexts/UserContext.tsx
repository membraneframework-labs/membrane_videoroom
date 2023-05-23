import React, { useContext, useState } from "react";

export type UserContextType = {
  username: string | null;
  setUsername: (name: string) => void;
};

const UserContext = React.createContext<UserContextType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export const UserProvider = ({ children }: Props) => {
  const [username, setUsername] = useState<string | null>(null);

  return <UserContext.Provider value={{ username, setUsername }}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
