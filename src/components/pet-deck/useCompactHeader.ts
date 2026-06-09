"use client";

import { useEffect, useState } from "react";

export function useCompactHeader() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(max-width: 767px)");

    if (!mediaQuery) {
      return undefined;
    }

    function syncCompactState() {
      setIsCompact(mediaQuery.matches);
    }

    syncCompactState();
    mediaQuery.addEventListener?.("change", syncCompactState);
    mediaQuery.addListener?.(syncCompactState);

    return () => {
      mediaQuery.removeEventListener?.("change", syncCompactState);
      mediaQuery.removeListener?.(syncCompactState);
    };
  }, []);

  return isCompact;
}
