import React from "react";
import ReactDOM from "react-dom/client";
import ReactModal from "react-modal";
import App from "./App";

ReactModal.setAppElement("#root");
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);
