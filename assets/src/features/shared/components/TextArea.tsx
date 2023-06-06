/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import clsx from "clsx";
import { ReactElement, TextareaHTMLAttributes } from "react";
import { Path, FieldError, UseFormRegister, FieldValues } from "react-hook-form";

export interface TextAreaProps<V extends FieldValues> extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  placeholder: string;
  name: Path<V>;
  error: FieldError | undefined;
  register: UseFormRegister<V>;
  pattern?: any;
  required?: any;
  icon?: ReactElement;
  info?: string;
}

export default function TextArea<V extends FieldValues>({
  label,
  placeholder,
  name,
  error,
  register,
  required,
  pattern,
  icon,
  disabled,
  info,
  className,
  ...props
}: TextAreaProps<V>) {
  return (
    <div className={clsx("inline-block", className)}>
      <div className="relative flex flex-col justify-items-start gap-2 text-start">
        <label htmlFor={name} className="font-aktivGrotesk text-base">
          {label}
        </label>
        <div className="group h-full">
          <div
            className={clsx(
              "h-5 rounded-3xl rounded-b-none border-2 border-b-0 border-brand-dark-blue-500 bg-brand-white group-hover:!border-brand-sea-blue-400 group-focus:!border-brand-sea-blue-400",
              error && "!border-brand-pink-500"
            )}
          ></div>
          <textarea
            id={name}
            maxLength={2001}
            rows={5}
            className={clsx(
              "h-auto min-h-[56px] w-full rounded-3xl rounded-t-none border-2 border-t-0 border-brand-dark-blue-500 bg-brand-white p-4 pt-0 font-aktivGrotesk text-base text-brand-dark-blue-500 outline-none group-hover:!border-brand-sea-blue-400 group-focus:!border-brand-sea-blue-400",
              icon && "!pr-10",
              disabled &&
                "group-hover:!border-grey-60 group-focus:!border-grey-60 cursor-not-allowed border-2 border-brand-grey-60 text-brand-grey-60",
              error && "border-2 !border-brand-pink-500"
            )}
            disabled={disabled}
            placeholder={placeholder}
            {...register(name, {
              required,
              pattern,
              maxLength: {
                value: 2000,
                message: "Maximum 2000 characters allowed.",
              },
            })}
            {...props}
          />
        </div>
        {icon && (
          <div className={clsx("absolute right-[10px] top-[45px]", disabled && "text-brand-grey-60")}>{icon}</div>
        )}
        {error?.message && (
          <div className={clsx("flex items-center gap-1 text-xs text-brand-pink-500")}>
            <div>{error?.message}</div>
          </div>
        )}
        {info && (
          <div className={clsx("flex items-center gap-1 text-xs", disabled && "!text-brand-grey-60")}>
            <svg width={15} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99996 9.99996C8.2091 9.99996 9.99996 8.2091 9.99996 5.99996C9.99996 3.79082 8.2091 1.99996 5.99996 1.99996C3.79082 1.99996 1.99996 3.79082 1.99996 5.99996C1.99996 8.2091 3.79082 9.99996 5.99996 9.99996ZM5.99996 11.3333C8.94548 11.3333 11.3333 8.94548 11.3333 5.99996C11.3333 3.05444 8.94548 0.666626 5.99996 0.666626C3.05444 0.666626 0.666626 3.05444 0.666626 5.99996C0.666626 8.94548 3.05444 11.3333 5.99996 11.3333Z"
                fill="currentColor"
              />
            </svg>
            <div>{info}</div>
          </div>
        )}
      </div>
    </div>
  );
}
