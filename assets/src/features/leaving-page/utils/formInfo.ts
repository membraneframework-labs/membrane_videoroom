import { Inputs } from "../components/Questionnaire";

// HOW TO SEND FORM TO GOOGLE FORMS WITH A LINK?

// 1. We create a Google sheet and use it as the basis for a form. We create responses to questions.
// 2. In the form, we click on the three dots in the upper right corner and choose "Get pre-filled URL."
// 3. On the screen, we fill out the form and copy the link to it.
// 4. The link contains information about the ID of each response (e.g., `video` -> `entry.1342523`).
// 5. By replacing "viewform" in the link with "formResponse?&submit=Submit,"
//    we get a link that, when clicked, submits the form.
//    The values of the responses are encoded as `entry.xxxxx` in the URL.

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

// The URL includes the `formResponse?&submit=Submit?usp=pp_url&` suffix
export const BASE_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfiO83St3R0S4yJ4p3vNw13p-0AOua7ZfOmXXtmLRtYWDYEaw/formResponse?&submit=Submit?usp=pp_url&";
export const keyToEntryMap: KeyToEntryMapType = {
  video: "entry.591363284",
  audio: "entry.757169526",
  screenshare: "entry.1384677715",
  comment: "entry.1456515354",
  email: "entry.1201063562",
};
