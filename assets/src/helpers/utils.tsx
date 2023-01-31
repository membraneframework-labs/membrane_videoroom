export const groupBy = <IN,>(arr: Array<IN>, criteria: (it: IN) => string): Record<string, Array<IN>> =>
  arr.reduce((acc, currentValue) => {
    if (!acc[criteria(currentValue)]) {
      acc[criteria(currentValue)] = [];
    }
    acc[criteria(currentValue)].push(currentValue);
    return acc;
  }, {} as Record<string, Array<IN>>);
