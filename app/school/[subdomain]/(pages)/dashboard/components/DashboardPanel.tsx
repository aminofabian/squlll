"use client";

interface DashboardPanelProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function DashboardPanel({
  title,
  description,
  children,
}: DashboardPanelProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40">
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-medium text-slate-800 dark:text-slate-100">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
