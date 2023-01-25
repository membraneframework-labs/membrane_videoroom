import React from "react";
import Button from "../features/shared/components/Button";

export default {
  title: "components/shared/Button",
  component: Button,
};

export const Normal = () => {
  return (
    <Button variant="normal" onClick={() => undefined}>
      Click me
    </Button>
  );
};

export const Disabled = () => {
  return (
    <Button variant="normal" disabled onClick={() => undefined}>
      Click me
    </Button>
  );
};

export const Light = () => {
  return (
    <div className="h-full w-full bg-brand-dark-blue-500 p-10">
      <Button variant="light" onClick={() => undefined}>
        Click me
      </Button>
    </div>
  );
};

export const Transparent = () => {
  return (
    <Button variant="transparent" onClick={() => undefined}>
      Click me
    </Button>
  );
};

export const TransparentLight = () => {
  return (
    <div className="h-full w-full bg-brand-dark-blue-500 p-10">
      <Button variant="transparent-light" onClick={() => undefined}>
        Click me
      </Button>
    </div>
  );
};

export const Custom = () => {
  return (
    <Button className="bg-red-500 p-4 text-white" onClick={() => undefined}>
      Click me
    </Button>
  );
};
