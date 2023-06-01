import { Inputs } from "../components/Questionnaire";
import { EntryName, keyToEntryMap } from "./formInfo";

type ResultType = {
  [K in EntryName]: string;
};

const renameKeysToEntries = (formInput: Inputs): ResultType => {
  const m = keyToEntryMap;
  const isKeyOfInputs = (k: string): k is keyof Inputs => k in formInput;
  const parseToString = (v: string | number | null): string =>  new String(v).toString();

  return Object.fromEntries(
    Object.keys(formInput)
      .filter(isKeyOfInputs)
      .map((k) => [k, parseToString(formInput[k])] as const)
      .filter(([_, v]) => v !== null)
      .map(([k, v]) => [m[k], v])
  ) as ResultType;
};

const parseToQuery = (formInput: Inputs): string => {
  const parsable = renameKeysToEntries(formInput);

  return new URLSearchParams(parsable).toString();
};

export default parseToQuery;
