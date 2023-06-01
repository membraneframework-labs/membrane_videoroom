import { Inputs } from "../components/Questionnaire";
import { BASE_URL } from "./formInfo";
import parseToQuery from "./parseToQuery";

const sendForm = async (form: Inputs) => {
  const query = parseToQuery(form);
  const url = BASE_URL.concat(query);

  // We use google url with url embedded answers.
  // A simple fetch is sufficient for our needs
  // The {mode: "no-cors"} allows the url to be fetched.

  // Since the request is opaque, we have no direct information
  // if the response has completed successfully or not.
  // In case of wrong input values, the `fetch` function logs `REQ_ERR` on stderr.
  fetch(url, { mode: "no-cors" }).then((response) => {
    console.log("Response", response);
  });
};

export default sendForm;
