"use client";

interface DashboardPanelEmptyProps {
  message: string;
}

export function DashboardPanelEmpty({ message }: DashboardPanelEmptyProps) {
  return (
    <p className="py-4 text-center text-xs leading-relaxed text-slate-400">
      {message}
    </p>
  );
}
