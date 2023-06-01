import { Inputs } from "../components/Questionnaire";

export const possibleEntryNames = [
  "entry.591363284",
  "entry.757169526",
  "entry.1384677715",
  "entry.1456515354",
  "entry.1201063562",
] as const;

export type EntryName = (typeof possibleEntryNames)[number];
type KeyToEntryMapType = {
  [Property in keyof Inputs]: EntryName;
};

export const BASE_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfiO83St3R0S4yJ4p3vNw13p-0AOua7ZfOmXXtmLRtYWDYEaw/formResponse?&submit=Submit?usp=pp_url&";
export const keyToEntryMap: KeyToEntryMapType = {
  video: "entry.591363284",
  audio: "entry.757169526",
  screenshare: "entry.1384677715",
  comment: "entry.1456515354",
  email: "entry.1201063562",
};
