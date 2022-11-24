import React, { FC } from "react";

export type Props = {
  text: string;
  id: string;
  status: boolean;
  onChange: () => void;
};

export const Checkbox: FC<Props> = ({ text, id, status, onChange }: Props) => {
  return (
    <div className="form-check mb-1">
      <label className="form-check-label text-gray-700 text-sm font-bold" htmlFor={id}>
        {text}
      </label>
      <input onChange={onChange} className="form-check-input ml-1" type="checkbox" checked={status} id={id} name={id} />
    </div>
  );
};
