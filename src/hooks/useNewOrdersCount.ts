import { useCallback, useEffect, useRef, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://home-pisos-backend.onrender.com";

const STORAGE_KEY = "hpv-admin:pedidos:lastSeenAt";
const POLL_INTERVAL_MS = 60_000;

interface OrderSummary {
  id: string;
  createdAt: string;
}

/** Primera vez que corre: no marcar como "nuevos" los pedidos ya existentes. */
const getLastSeenAt = (): number => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const parsed = stored ? Number(stored) : NaN;
  if (!Number.isNaN(parsed)) return parsed;
  const now = Date.now();
  localStorage.setItem(STORAGE_KEY, String(now));
  return now;
};

/**
 * Cuenta los pedidos creados después de la última vez que se visitó la
 * sección de Pedidos, para mostrar un badge de "nuevos" en el sidebar.
 */
export function useNewOrdersCount() {
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const lastSeenAtRef = useRef<number>(getLastSeenAt());

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders`);
      if (!res.ok) return;
      const data: OrderSummary[] = await res.json();
      if (!Array.isArray(data)) return;
      const unseen = data.filter(
        (o) => new Date(o.createdAt).getTime() > lastSeenAtRef.current
      ).length;
      setNewOrdersCount(unseen);
    } catch {
      // Silencioso: si falla, el badge simplemente no se actualiza esta vez.
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const markAllSeen = useCallback(() => {
    const now = Date.now();
    lastSeenAtRef.current = now;
    localStorage.setItem(STORAGE_KEY, String(now));
    setNewOrdersCount(0);
  }, []);

  return { newOrdersCount, markAllSeen };
}
