import React from "react";

type Props = {
    numberOfLeftTiles: number
}

const OthersTile = ({numberOfLeftTiles}: Props) => {
    return <div className="h-full w-full bg-brand-dark-blue-200">
        <span>{`+ ${numberOfLeftTiles} others`}</span>
    </div>
}

export default OthersTile;