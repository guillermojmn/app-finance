import { useCallback, useEffect, useState } from "react";

const CACHE_KEY = "fx-rates-chf";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 horas

function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.at < CACHE_TTL) return cached.rates;
  } catch {
    // ignore
  }
  return null;
}

// rates[X] = cuántas unidades de X equivalen a 1 CHF
export function useExchangeRates() {
  const [rates, setRates] = useState(() => readCache() || { CHF: 1, EUR: 1, USD: 1 });
  const [loading, setLoading] = useState(() => !readCache());

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setRates(cached);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("https://api.frankfurter.dev/v1/latest?from=CHF&to=EUR,USD");
        const data = await res.json();
        const fresh = { CHF: 1, EUR: data.rates.EUR, USD: data.rates.USD };
        if (!cancelled) {
          setRates(fresh);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), rates: fresh }));
        }
      } catch (e) {
        console.warn("No se pudieron obtener los tipos de cambio, usando 1:1 por ahora", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const convert = useCallback(
    (amount, from, to) => {
      const n = Number(amount) || 0;
      if (from === to) return n;
      const chf = n / (rates[from] || 1);
      return chf * (rates[to] || 1);
    },
    [rates]
  );

  return { rates, convert, loading };
}
