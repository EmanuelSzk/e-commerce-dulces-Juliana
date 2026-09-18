"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// When the browser's back button restores a page from its back/forward cache
// (e.g. returning from Mercado Pago), it shows the page exactly as it was —
// with a stale cart count. Re-fetch the server-rendered parts in that case.
export function RefreshOnRestore() {
  const router = useRouter();

  useEffect(() => {
    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) router.refresh();
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [router]);

  return null;
}
