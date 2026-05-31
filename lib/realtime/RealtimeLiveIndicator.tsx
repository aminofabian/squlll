"use client";

import { cn } from "@/lib/utils";
import { useRealtime } from "./RealtimeProvider";

export type RealtimeLiveIndicatorProps = {
  className?: string;
  /** Show label text beside the dot (default true). */
  showLabel?: boolean;
};

export function RealtimeLiveIndicator({
  className,
  showLabel = true,
}: RealtimeLiveIndicatorProps) {
  const { connected, connectionError, socket } = useRealtime();

  const isConnecting = Boolean(socket) && !connected && !connectionError;
  const isLive = connected;
  const isOffline = Boolean(connectionError) || (Boolean(socket) && !connected);

  const label = isLive ? "Live" : isConnecting ? "Connecting" : "Offline";

  const title = isLive
    ? "Live updates connected"
    : connectionError
      ? `Offline — ${connectionError}`
      : isConnecting
        ? "Connecting to live updates…"
        : "Live updates unavailable";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em]",
        isLive && "text-emerald-700 dark:text-emerald-400",
        isConnecting && "text-amber-700 dark:text-amber-400",
        isOffline && !isConnecting && "text-slate-400 dark:text-slate-500",
        className,
      )}
      title={title}
      aria-label={title}
      role="status"
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          isLive && "bg-emerald-500",
          isConnecting && "animate-pulse bg-amber-400",
          isOffline && !isConnecting && "bg-slate-300 dark:bg-slate-600",
        )}
        aria-hidden
      />
      {showLabel ? label : null}
    </span>
  );
}
