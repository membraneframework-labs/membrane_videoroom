import React, { useState } from "react";

export type PinningApi = {
    pinnedTrackId: string;
    pin: (trackId: string) => void;
    unpin: () => void;
} 

const usePinning = () : PinningApi => {
    const [pinnedTrackId, setPinnedTrackId] = useState<string>("");
    
    return {pinnedTrackId: pinnedTrackId,
         pin: setPinnedTrackId,
         unpin: () => setPinnedTrackId("")}
        };

export default usePinning;