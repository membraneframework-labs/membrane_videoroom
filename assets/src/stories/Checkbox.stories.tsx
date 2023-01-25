import React, { useState } from "react";
import { Checkbox } from "../features/shared/components/Checkbox";

export default {
  title: "components/shared/Checkbox",
  component: Checkbox,
};

export const Normal = () => {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox label="Simulcast" status={checked} id="example-checkbox" onChange={() => setChecked((prev) => !prev)} />
  );
};
