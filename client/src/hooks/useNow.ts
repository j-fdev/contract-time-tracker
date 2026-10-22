import { useEffect, useState } from 'react';

import { nowInSeconds } from '../utils/time';

/** The current time in seconds, refreshed every second while `isTicking` is true. */
export function useNow(isTicking: boolean): number {
    const [now, setNow] = useState(nowInSeconds);

    useEffect(() => {
        setNow(nowInSeconds());
        if (!isTicking) return;
        const intervalId = window.setInterval(() => setNow(nowInSeconds()), 1000);
        return () => window.clearInterval(intervalId);
    }, [isTicking]);

    return now;
}
