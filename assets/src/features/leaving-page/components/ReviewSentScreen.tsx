import React, { FC } from "react";
import Rocket from "../icons/🚀";

const ReviewSentScreen: FC = () => {
  return (
    <div aria-label="review-sent" className="align-center flex flex-col flex-wrap justify-center gap-20 p-0">
      <h2 className="text-2xl font-medium sm:text-4xl">Thank you for participating!</h2>
      <div>
        <div
          aria-label="review-sent-illustration"
          className="flex flex-col flex-wrap items-center justify-center gap-10 p-0"
        >
          <Rocket className="" />
          <span className="text-2xl">Your review was sent!</span>
        </div>
      </div>
    </div>
  );
};

export default ReviewSentScreen;
