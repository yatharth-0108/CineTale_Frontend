import { useCallback, useEffect, useState } from 'react';
export function useAsync(fn, deps = []) {
  const [s, set] = useState({ data: null, loading: true, error: null });
  const run = useCallback(() => {
    let live = true; set((p) => ({ ...p, loading: true, error: null }));
    fn().then((data) => live && set({ data, loading: false, error: null })).catch((error) => live && set({ data: null, loading: false, error }));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => run(), [run]);
  return { ...s, reload: run };
}
