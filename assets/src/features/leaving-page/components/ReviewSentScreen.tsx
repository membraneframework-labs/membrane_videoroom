import React, { FC } from "react";
import Rocket from "../icons/🚀";

const ReviewSentScreen: FC = () => {
    return (<div aria-label="review-sent" className="flex flex-wrap flex-col justify-center align-center p-0 gap-20">
        <h2 className="text-2xl font-medium sm:text-4xl">Thank you for participating!</h2>
        <div>
            <div aria-label="review-sent-illustration" className="flex flex-wrap flex-col justify-center items-center p-0 gap-10">
                <Rocket className=""/>
                <span className="text-2xl">Your review was sent!</span>
            </div>
        </div>
        </div>);
}


export default ReviewSentScreen;