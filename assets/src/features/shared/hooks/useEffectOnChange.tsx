import { useEffect, useRef } from "react";

/**
 * This hook only triggers an effect function if the value passed as the first parameter changes.
 *
 * @param value - Effect will only activate if the value changes.
 * @param effect - Imperative function that can return a cleanup function.
 * @param comparator - If the value is not a primitive type, such as a numerical or string value,
 * you must provide a comparator function to prevent unnecessary invocations.
 */
const useEffectOnChange = <T,>(
  value: T,
  effect: (prevValue?: T, currentValue?: T) => void | (() => void),
  comparator?: (a: T, b?: T) => boolean
) => {
  const prevValueRef = useRef<T>();

  useEffect(() => {
    prevValueRef.current = value;
  });

  const prevValue = prevValueRef.current;

  useEffect(() => {
    if (comparator ? !comparator(value, prevValue) : value !== prevValue) {
      return effect(prevValue, value);
    } else return;
  }, [comparator, effect, prevValue, value]);
};

export default useEffectOnChange;
