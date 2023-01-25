import React, { useState } from "react";
import Input from "../features/shared/components/Input";

export default {
  title: "components/shared/Input",
  component: Input,
};

export const Normal = () => {
  const [name, setName] = useState<string | undefined>();
  return (
    <Input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Name" label="First name" />
  );
};

export const Disabled = () => {
  return <Input value="John" onChange={() => undefined} type="text" placeholder="Name" label="First name" disabled />;
};

export const Error = () => {
  return <Input value="John" onChange={() => undefined} type="text" placeholder="Name" label="First name" error />;
};

export const AdditionalText = () => {
  const [name, setName] = useState<string | undefined>();
  return (
    <Input
      value={name}
      onChange={(e) => setName(e.target.value)}
      type="text"
      placeholder="Name"
      label="First name"
      additionalText="Enter your first name"
    />
  );
};
