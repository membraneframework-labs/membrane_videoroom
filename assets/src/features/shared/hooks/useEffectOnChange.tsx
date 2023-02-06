import { useEffect, useRef } from "react";

const useEffectOnChange = <T,>(
  value: T,
  effect: (prevValue?: T) => void | (() => void),
  comparator?: (a: T, b?: T) => boolean
) => {
  const prevValueRef = useRef<T>();

  useEffect(() => {
    prevValueRef.current = value;
  });

  const prevValue = prevValueRef.current;

  useEffect(() => {
    if (comparator ? !comparator(value, prevValue) : value !== prevValue) {
      return effect(prevValue);
    } else return;
  }, [comparator, effect, prevValue, value]);
};

export default useEffectOnChange;
