import { useCallback, useState } from "react";

type UseToggleResult = [boolean, () => void];

export const useToggle = (initialState = false, callback?: (newValue: boolean) => void): UseToggleResult => {
  const [state, setState] = useState(initialState);

  const toggle = useCallback(() => {
    setState((prevState) => {
      callback?.(!prevState);
      return !prevState;
    });
  }, [callback]);

  return [state, toggle];
};
