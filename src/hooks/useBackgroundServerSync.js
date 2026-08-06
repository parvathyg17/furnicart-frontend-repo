import { useCallback, useEffect, useRef } from "react";


export function useBackgroundServerSync({
  enabled = true,
  onRefresh,
  pollIntervalMs = null,
  debounceMs = 450,
}) {
  const onRefreshRef = useRef(onRefresh);

  onRefreshRef.current = onRefresh;

  const debounceTimerRef = useRef(null);

  const inFlightRef = useRef(false);

  const schedule = useCallback(() => {
    if (!enabled) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(
      () => {
        debounceTimerRef.current = null;

        if (document.visibilityState !== "visible") {
          return;
        }

        if (inFlightRef.current) {
          return;
        }

        inFlightRef.current = true;

        Promise.resolve(onRefreshRef.current()).finally(() => {
          inFlightRef.current = false;
        });
      },

      debounceMs,
    );
  }, [enabled, debounceMs]);

  useEffect(() => {
    if (!enabled) return;

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        schedule();
      }
    };

    const onOnline = () => schedule();

    window.addEventListener("focus", schedule);

    window.addEventListener("online", onOnline);

    document.addEventListener("visibilitychange", onVisibility);

    let pollId = null;

    if (pollIntervalMs != null && pollIntervalMs > 0) {
      pollId = setInterval(onVisibility, pollIntervalMs);
    }

    return () => {
      window.removeEventListener("focus", schedule);

      window.removeEventListener("online", onOnline);

      document.removeEventListener("visibilitychange", onVisibility);

      if (pollId) clearInterval(pollId);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);

        debounceTimerRef.current = null;
      }
    };
  }, [enabled, pollIntervalMs, schedule]);
}
