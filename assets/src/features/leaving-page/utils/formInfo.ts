import { Inputs } from "../components/Questionnaire"

type keyToEntryMapType = {
    [Property in keyof Inputs]: string;
}

export const BASE_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfiO83St3R0S4yJ4p3vNw13p-0AOua7ZfOmXXtmLRtYWDYEaw/formResponse?&submit=Submit?usp=pp_url&"
export const keyToEntryMap: keyToEntryMapType = {
    video: "entry.591363284",
    audio: "entry.757169526",
    screenshare: "entry.1384677715",
    comment: "entry.1456515354",
    email: "entry.1201063562",
}