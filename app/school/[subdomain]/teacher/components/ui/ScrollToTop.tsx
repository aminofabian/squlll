"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/** Quiet back-to-top control for long teacher pages. */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "tp-focus fixed bottom-24 right-4 z-40 flex size-9 items-center justify-center rounded-full border border-border/80 bg-card/90 text-muted-foreground shadow-[0_10px_30px_-16px_rgba(20,32,28,0.4)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground lg:bottom-8 lg:right-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ArrowUp className="size-4" strokeWidth={2} />
    </button>
  );
}
