import React, { FC } from "react";

type RatingProps = {
    title: string;
}

const Rating : FC<RatingProps> = ({title}) => {
    return (<div className="w-64 h-16">{title}</div>);
}

export default Rating;