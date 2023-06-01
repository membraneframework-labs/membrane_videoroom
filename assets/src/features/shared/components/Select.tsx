import React, { FC } from "react";
import ReactSelect from "react-select";
import clsx from "clsx";

export type SelectProps = Omit<React.ComponentProps<typeof ReactSelect>, "onChange"> & {
  onChange?: (value: SelectOption) => void;
  controlClassName?: string;
};

export type SelectOption = {
  value: string;
  label: string;
};

export const Select: FC<SelectProps> = ({ onChange, controlClassName, ...otherProps }) => {
  return (
    <ReactSelect
      unstyled
      classNamePrefix="react-select"
      styles={{
        menu: (base) => {
          return {
            ...base,
            top: "calc(100% + 11px)",
          };
        },
      }}
      classNames={{
        control: (state) => clsx(controlClassName, state.isFocused && "border-brand-sea-blue-400"),
        option: (state) =>
          clsx(
            "px-4 py-3.5 hover:bg-brand-dark-blue-100 focus-within:bg-brand-dark-blue-100",
            state.isFocused && "bg-brand-dark-blue-100"
          ),
        menu: () =>
          "max-h-40 rounded-lg border-brand-dark-blue-200 border-2 overflow-y-auto bg-brand-white flex flex-col",
      }}
      onChange={(v) => onChange?.(v as SelectOption)}
      {...otherProps}
    />
  );
};
