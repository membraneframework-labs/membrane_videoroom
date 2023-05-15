/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
// import { ExclamationCircleIcon } from '@heroicons/react/outline';
import clsx from 'clsx';
import { ReactElement, TextareaHTMLAttributes } from 'react';
// import { Path, FieldError, UseFormRegister } from 'react-hook-form';

export interface TextAreaProps<V> extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  placeholder: string;
//   name: Path<V>;
//   error: FieldError | undefined;
//   register: UseFormRegister<V>;
  pattern?: any;
  required?: any;
  icon?: ReactElement;
  info?: string;
}

export default function TextArea<V>({
  label,
  placeholder,
//   name,
//   error,
//   register,
  required,
  pattern,
  icon,
  disabled,
  info,
  className,
  ...props
}: TextAreaProps<V>) {
  return (
    <div className={clsx('inline-block', className)}>
      <div className="flex flex-col gap-2 relative justify-items-start text-start">
        <label className="text-base font-aktivGrotesk">{label}</label>
        <div className="h-full group">
          <div
            className={clsx(
              'border-brand-dark-blue-500 group-hover:!border-brand-sea-blue-300 group-focus:!border-brand-sea-blue-300 border-2 border-b-0 rounded-3xl rounded-b-none h-5 bg-brand-white',
            //   error && '!border-brand-pink-500',
            )}
          ></div>
          <textarea
            maxLength={2001}
            rows={5}
            className={clsx(
              'outline-none border-brand-dark-blue-500 group-hover:!border-brand-sea-blue-300 group-focus:!border-brand-sea-blue-300 text-brand-dark-blue-500 border-2 border-t-0 rounded-3xl rounded-t-none min-h-[56px] h-auto p-4 pt-0 bg-brand-white text-base w-full font-aktivGrotesk',
              icon && '!pr-10',
              disabled &&
                'border-[#B2B9CC] text-[#B2B9CC] border-2 cursor-not-allowed group-hover:!border-[#B2B9CC] group-focus:!border-[#B2B9CC]',
            //   error && '!border-brand-pink-500 border-2',
            )}
            disabled={disabled}
            placeholder={placeholder}
            // {...register(name, {
            //   required,
            //   pattern,
            //   maxLength: {
            //     value: 2000,
            //     message: 'Maximum 2000 characters allowed.',
            //   },
            // })}
            {...props}
          />
        </div>
        {icon && (
          <div className={clsx('absolute right-[10px] top-[45px]', disabled && 'text-[#B2B9CC]')}>{icon}</div>
        )}
        {/* {error?.message && (
          <div className={clsx('flex gap-1 items-center text-xs text-brand-pink-500')}>
            <ExclamationCircleIcon className="w-4 h-4" />
            <div>{error?.message}</div>
          </div>
        )} */}
        {info && (
          <div className={clsx('flex gap-1 items-center text-xs', disabled && '!text-[#B2B9CC]')}>
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
