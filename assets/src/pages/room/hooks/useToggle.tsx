import { useCallback, useState } from "react";

type UseToggleResult = [boolean, () => void];

export const useToggle = (initialState = false): UseToggleResult => {
  const [state, setState] = useState(initialState);

  const toggle = useCallback(() => setState((prevState) => !prevState), []);

  return [state, toggle];
};
