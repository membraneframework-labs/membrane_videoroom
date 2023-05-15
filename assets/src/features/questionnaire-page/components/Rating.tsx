import React, { FC, useState } from "react";
import Button from "../../shared/components/Button";
import Star from "../icons/Star";
import clsx from "clsx";

type StarButtonProps = {
  isActive: boolean;
  isHoverActive: boolean;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
};

type RatingProps = {
  title: string;
};

const StarButton = ({ isActive, isHoverActive, onClick, onHover, onLeave }: StarButtonProps) => {
  const fillColor = isHoverActive ? "fill-brand-dark-blue-200" : 
                    isActive ? "fill-brand-dark-blue-300" :
                    "fill-brand-white";

  return (
    <div className="flex-none flex-grow-0" onClick={onClick} onMouseEnter={onHover} onMouseLeave={onLeave}>
      <Star className={fillColor} />
    </div>
  );
};

const Rating: FC<RatingProps> = ({ title }) => {
  const [rateValue, setRateValue] = useState<number>(0);
  const [hoverRateValue, setHoverRateValue] = useState<number | null>(null);

  const ratingsFromOneToFive = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col flex-wrap gap-4 p-0">
      <div className="font-aktivGrotesk text-lg ">{title}</div>
      <div className="flex flex-row flex-wrap gap-3 rounded-xl bg-brand-white px-8 py-10">
        {ratingsFromOneToFive.map((rateIndex) => (
          <StarButton
            key={rateIndex}
            isActive={hoverRateValue === null && rateIndex <= rateValue}
            isHoverActive={hoverRateValue !== null && rateIndex <= hoverRateValue}
            onClick={() => setRateValue(rateIndex)}
            onHover={() => setHoverRateValue(rateIndex)}
            onLeave={() => setHoverRateValue(null)}
          />
        ))}
      </div>
    </div>
  );
};

export default Rating;
