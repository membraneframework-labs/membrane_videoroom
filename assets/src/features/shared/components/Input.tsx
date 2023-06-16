import clsx from "clsx";
import React from "react";
import Info from "../../leaving-page/icons/Info";
import { Select, SelectOption, SelectProps } from "./Select";

type InputType = "text" | "select"; // add other types if needed

type BaseInputProps = {
  name?: string;
  type?: InputType;
  placeholder?: string;
  label?: string;
  additionalText?: string;
  disabled?: boolean;
  error?: boolean;
  disableAutocomplete?: boolean;
  className?: string;
  wrapperClassName?: string;
};

type SelectInputProps = BaseInputProps &
  SelectProps & {
    type: "select";
    value?: SelectOption;
  };

type TextInputProps = BaseInputProps & {
  type: "text";
  value?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

type InputProps = SelectInputProps | TextInputProps;

const Input: React.FC<InputProps> = (props) => {
  const {
    value,
    onChange,
    onBlur,
    type,
    placeholder,
    label,
    name,
    additionalText,
    disabled,
    error,
    disableAutocomplete = true,
    className,
    wrapperClassName,
    ...otherProps
  } = props;

  const inputClassName = clsx(
    "w-full px-3.5 py-3",
    "rounded-[40px] border-2 text-brand-dark-blue-500 focus:outline-none",
    error
      ? "border-brand-red"
      : disabled
      ? "border-brand-grey-60 bg-white text-brand-grey-80"
      : "border-brand-dark-blue-500 hover:border-brand-sea-blue-400 focus:border-brand-sea-blue-400",
    "appearance-none",
    className
  );

  const getComponent = () => {
    switch (type) {
      case "select":
        return (
          <Select
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            options={props.options}
            isDisabled={disabled}
            controlClassName={inputClassName}
            {...otherProps}
          />
        );

      case "text":
      default:
        return (
          <input
            id={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={inputClassName}
            name={name}
            type={type}
            placeholder={placeholder}
            required={props.required}
            disabled={disabled}
            autoComplete={disableAutocomplete ? "off" : "on"}
          />
        );
    }
  };

  return (
    <div className={clsx("w-full space-y-2 font-aktivGrotesk", wrapperClassName)}>
      {label && (
        <label htmlFor={name} className="block text-base text-brand-dark-blue-500">
          {label}
        </label>
      )}

      {getComponent()}

      {additionalText && (
        <div className="text-xm flex items-center gap-1">
          <Info
            className={clsx(
              disabled ? "text-brand-grey-80" : error ? "stroke-brand-red" : "stroke-brand-dark-blue-500"
            )}
          />
          <span
            className={clsx(
              "block text-sm",
              disabled ? "text-brand-grey-80" : error ? "text-brand-red" : "text-brand-dark-blue-500"
            )}
          >
            {additionalText}
          </span>
        </div>
      )}
    </div>
  );
};

export default Input;
