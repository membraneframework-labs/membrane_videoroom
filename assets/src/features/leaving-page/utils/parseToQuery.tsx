import { Inputs } from "../components/Questionnaire";
import { EntryName, keyToEntryMap } from "./formInfo";

type ResultType = {
  [K in EntryName]: string;
};

const renameKeysToEntries = (formInput: Inputs): ResultType => {
  const m = keyToEntryMap;
  const isKeyOfInputs = (k: string): k is keyof Inputs => k in formInput;

  return Object.fromEntries(
    Object.keys(formInput)
      .filter(isKeyOfInputs)
      .map(k => [k, new String(formInput[k])] as const)
      .filter(([_, v]) => v !== null)
      .map(([k, v]) => [m[k], v])
  ) as ResultType;
};

const parseToQuery = (formInput: Inputs): string => {
  const parsable = renameKeysToEntries(formInput);

  return new URLSearchParams(parsable).toString();
};

export default parseToQuery;
