import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../api/client';

/** Loads data from the API once, and exposes a `reload` function to refresh it. */
export function useApiResource<T>(load: () => Promise<T>, initialValue: T) {
    const [data, setData] = useState<T>(initialValue);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const reload = useCallback(async () => {
        try {
            setData(await load());
            setError(null);
        } catch (loadError) {
            setError(getErrorMessage(loadError));
        } finally {
            setIsLoading(false);
        }
    }, [load]);

    useEffect(() => {
        void reload();
    }, [reload]);

    return { data, error, isLoading, reload };
}
