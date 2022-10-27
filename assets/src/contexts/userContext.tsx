import React from "react";

export type UserContextType = {
  username: string | null;
  setUsername: (name: string) => void;
};

export const UserContext = React.createContext<UserContextType>({
  username: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setUsername: () => {},
});
