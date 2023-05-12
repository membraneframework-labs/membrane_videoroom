import React from "react";
import { SelectOption } from "../shared/components/Select";
import Input from "../shared/components/Input";

type Props = {
  name: string;
  devices: MediaDeviceInfo[] | null;
  setInput: (value: string | null) => void;
  inputValue: string | null;
};

export const DeviceSelector = ({ name, devices, setInput, inputValue }: Props) => {
  const options: SelectOption[] = (devices || []).map(({ deviceId, label }) => ({
    value: deviceId,
    label,
  }));

  return (
    <Input
      wrapperClassName="mt-14"
      label={name}
      type="select"
      options={options}
      onChange={(option) => {
        setInput(option.value);
      }}
      value={options.find(({ value }) => value === inputValue)}
    />
  );
};
