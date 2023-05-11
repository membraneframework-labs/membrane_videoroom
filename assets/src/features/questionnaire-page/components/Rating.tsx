import React, { FC } from "react";
import Button from "../../shared/components/Button";
import Star from "../icons/Star";

type RatingProps = {
  title: string;
};

const StarButton = () => {
  return (
    <Button
      className="h-6 w-6"
      onClick={() => {
        console.log("Do something");
      }}
    >
      <Star/>
    </Button>
  );
};

const Rating: FC<RatingProps> = ({ title }) => {
  return (
    <div className="flex flex-col flex-wrap gap-4 p-0">
      <div className="text-lg font-aktivGrotesk ">{title}</div>
      <div className="flex flex-row flex-wrap gap-3 rounded-xl bg-brand-white px-8 py-10">
        <StarButton />
        <StarButton />
        <StarButton />
        <StarButton />
        <StarButton />
      </div>
    </div>
  );
};

export default Rating;
