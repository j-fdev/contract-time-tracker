import { useEffect, useState } from 'react';

/** Like useState, but the value survives page reloads. */
export function useLocalStorage(key: string, initialValue: string) {
    const [value, setValue] = useState(() => {
        try {
            return window.localStorage.getItem(key) ?? initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            if (value) window.localStorage.setItem(key, value);
            else window.localStorage.removeItem(key);
        } catch {
            // Storage can be unavailable (private mode); the value still works for this session.
        }
    }, [key, value]);

    return [value, setValue] as const;
}
