import React, { FC } from "react";
import ReactSelect from "react-select";

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
        control: () => controlClassName ?? "",
        option: () => "px-4 py-3.5 hover:bg-brand-dark-blue-100 focus-within:bg-brand-dark-blue-100",
        menu: () =>
          "max-h-40 rounded-3xl border-brand-dark-blue-200 border-2 overflow-y-auto bg-brand-white flex flex-col",
      }}
      onChange={(selectOption) => onChange?.(selectOption as SelectOption)}
      {...otherProps}
    />
  );
};
