import { addons } from "@storybook/addons";

import theme from "./theme";
import membrane from "./membrane.svg";

addons.setConfig({
  theme: theme,
});

const link = document.createElement("link");
link.setAttribute("rel", "shortcut icon");
link.setAttribute("href", membrane);
document.head.appendChild(link);
