import { Inputs } from "../components/Questionnaire";
import { EntryName, keyToEntryMap } from "./formInfo";

type ResultType = {
  [K in EntryName]: string;
};

const renameKeysToEntries = (formInput: Inputs): ResultType => {
  const m = keyToEntryMap;

  return Object.fromEntries(
    Object.keys(formInput)
      .filter((k) => k in formInput) //TODO merge this nad next line with type guard
      .map((k) => {
        const k1 = k as keyof Inputs;
        return k1;
      })
      .map((k) => {
        const v = new String(formInput[k]);
        return [k, v] as const;
      })
      .filter(([_, v]) => v !== null)
      .map(([k, v]) => [m[k], v])
  ) as ResultType;
};

const parseToQuery = (formInput: Inputs): string => {
  const parsable = renameKeysToEntries(formInput);

  return new URLSearchParams(parsable).toString();
};

export default parseToQuery;
