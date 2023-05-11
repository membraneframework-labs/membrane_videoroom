import React, { FC } from "react";

type RatingProps = {
    title: string;
}

const Star = () => {
    return <div className="w-6 h-6">SS</div>
}

const Rating : FC<RatingProps> = ({title}) => {
    return (<div className="flex flex-wrap flex-col p-0 gap-4">
            <div>{title}</div>
            <div className="flex flex-wrap flex-row bg-brand-white rounded-xl px-8 py-10 gap-3">
                <Star/>
                <Star/>
                <Star/>
                <Star/>
                <Star/>
            </div>
        </div>);
}

export default Rating;