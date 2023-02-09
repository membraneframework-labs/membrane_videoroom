export const groupBy = <IN, KEY extends string | number>(
  arr: Array<IN>,
  criteria: (it: IN) => KEY
): Partial<Record<KEY, Array<IN>>> =>
  arr.reduce((acc, currentValue) => {
    if (!acc[criteria(currentValue)]) {
      acc[criteria(currentValue)] = [];
    }
    acc[criteria(currentValue)].push(currentValue);
    return acc;
  }, {} as Record<KEY, Array<IN>>);
