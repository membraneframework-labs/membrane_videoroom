import React, { useState } from "react";
import Star from "../icons/Star";
import clsx from "clsx";
import { FieldValues, Path } from "react-hook-form";

type StarButtonProps = {
  isActive: boolean;
  isHoverActive: boolean;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
};

type RatingProps<V extends FieldValues> = {
  name: Path<V>;
  value: number | null;
  onChange: (newValue: number) => void;
};

const StarOption = ({ isActive, isHoverActive, onClick, onHover, onLeave }: StarButtonProps) => {
  const fillColor = isHoverActive
    ? "fill-brand-dark-blue-200"
    : isActive
    ? "fill-brand-dark-blue-300"
    : "fill-brand-white";

  return (
    <button
      type="button"
      className="flex-none flex-grow-0 items-center"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <Star className={clsx(fillColor, "h-6 w-6")} />
    </button>
  );
};

const Rating = <V extends FieldValues>({ name, value, onChange }: RatingProps<V>) => {
  const [rateValue, setRateValue] = useState<number>(value ?? 0);
  const [hoverRateValue, setHoverRateValue] = useState<number | null>(null);

  const ratingsFromOneToFive = Array.from({ length: 5 }, (_, i) => i + 1);

  const capitalize = (word: string) => (word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : "");
  const title = `${capitalize(name)} Quality`;

  const handleOnClick = (newValue: number) => {
    const newValueOrZero = newValue === rateValue ? 0 : newValue;

    onChange(newValueOrZero);
    setRateValue(newValueOrZero);
    setHoverRateValue(null);
  };

  return (
    <div className="flex flex-col flex-wrap items-center gap-4 p-0">
      <div className="font-aktivGrotesk text-lg ">{title}</div>
      <div className="flex flex-row flex-wrap items-center justify-center gap-6 rounded-xl bg-brand-white px-7 py-5 sm:gap-3 sm:px-8 sm:py-10">
        {ratingsFromOneToFive.map((rateIndex) => (
          <StarOption
            key={rateIndex}
            isActive={hoverRateValue === null && rateIndex <= rateValue}
            isHoverActive={hoverRateValue !== null && rateIndex <= hoverRateValue}
            onClick={() => {
              handleOnClick(rateIndex);
            }}
            onHover={() => setHoverRateValue(rateIndex)}
            onLeave={() => setHoverRateValue(null)}
          />
        ))}
      </div>
    </div>
  );
};

export default Rating;
