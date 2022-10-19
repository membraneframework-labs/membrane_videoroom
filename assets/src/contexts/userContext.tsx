import React from "react";

export type UserContextType = {
  username: string | null;
  setUsername: (name: string) => void;
};

export const UserContext = React.createContext<UserContextType>({
  username: null,
  setUsername: () => {},
});
