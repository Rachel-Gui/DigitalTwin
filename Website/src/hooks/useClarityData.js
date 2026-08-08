import { useCallback, useEffect, useMemo, useState } from "react";
import { claritySourceNumber } from "../data/airQuality";

export default function useClarityData() {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await fetch("/api/clarity", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || payload.error || "Unable to load air-quality data.");
      setState({ loading: false, data: payload, error: null });
    } catch (error) {
      setState({ loading: false, data: null, error: error.message });
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const sources = useMemo(
    () => [...(state.data?.sources || [])].sort((a, b) => claritySourceNumber(a.name) - claritySourceNumber(b.name)),
    [state.data],
  );
  return { state, load, sources };
}
