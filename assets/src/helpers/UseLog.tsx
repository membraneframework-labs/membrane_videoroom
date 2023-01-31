import { useEffect } from "react";

export const useLog = (state: any, name: string) => {
  useEffect(() => {
    console.log({ name: name, state });
  }, [state, name]);
};
