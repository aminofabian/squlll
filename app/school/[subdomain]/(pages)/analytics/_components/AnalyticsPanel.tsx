"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart3,
  GraduationCap,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SchoolEmpty,
  SchoolLoading,
  SchoolPage,
  SchoolPanel,
  SchoolStat,
  outlineButtonClass,
  primaryButtonClass,
  thClass,
} from "@/components/school/SchoolContentPage";
import {
  fetchSchoolFinancialSummary,
  fetchStudentsSummaryByGradeLevel,
  fetchTenantLiveStats,
  type GradeLevelSummary,
} from "@/lib/school/analytics";

const money = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

function formatMoney(value: number | null | undefined): string {
  const amount = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return money.format(amount);
}

/** Share of billed fees already collected: paid / (paid + outstanding). */
function collectionRate(row: GradeLevelSummary): number | null {
  const billed = row.totalFeesPaid + row.totalBalance;
  if (billed <= 0) return null;
  return row.totalFeesPaid / billed;
}

function collectionBadgeClass(rate: number): string {
  if (rate >= 0.75) {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  }
  if (rate >= 0.4) {
    return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  }
  return "bg-red-500/15 text-red-600 dark:text-red-400";
}

/**
 * Read-only analytics overview for a school: headline enrolment and fee tiles
 * plus a per-grade collection breakdown. All data is fetched from the GraphQL
 * read queries and never mutated.
 */
export function AnalyticsPanel() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["school-analytics", subdomain],
    enabled: Boolean(subdomain),
    queryFn: async () => {
      const [financial, live, byGrade] = await Promise.all([
        fetchSchoolFinancialSummary(subdomain),
        fetchTenantLiveStats(subdomain),
        fetchStudentsSummaryByGradeLevel(subdomain),
      ]);
      return { financial, live, byGrade };
    },
  });

  const lastErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (isError) {
      const message =
        error instanceof Error ? error.message : "Failed to load analytics";
      if (lastErrorRef.current !== message) {
        lastErrorRef.current = message;
        toast.error(message);
      }
    } else {
      lastErrorRef.current = null;
    }
  }, [isError, error]);

  const handleRefresh = async () => {
    const result = await refetch();
    if (!result.error) toast.success("Analytics refreshed");
  };

  return (
    <SchoolPage
      eyebrow="Insights"
      title="Analytics"
      subtitle="School-wide enrolment, fee collection and live activity at a glance."
      actions={
        <Button
          type="button"
          variant="outline"
          className={outlineButtonClass}
          disabled={isFetching}
          onClick={() => void handleRefresh()}
        >
          <RefreshCw className={isFetching ? "animate-spin" : undefined} />
          Refresh
        </Button>
      }
    >
      {isLoading ? (
        <SchoolPanel title="Analytics">
          <SchoolLoading label="Crunching the numbers…" />
        </SchoolPanel>
      ) : isError ? (
        <SchoolPanel title="Analytics unavailable">
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
            <p className="max-w-md text-sm text-[#1a4d42]/60 dark:text-white/50">
              {error instanceof Error
                ? error.message
                : "Failed to load analytics."}
            </p>
            <Button
              type="button"
              className={primaryButtonClass}
              onClick={() => void handleRefresh()}
            >
              Try again
            </Button>
          </div>
        </SchoolPanel>
      ) : data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SchoolStat
              label="Active students"
              value={data.financial.totalStudents.toLocaleString()}
              icon={Users}
            />
            <SchoolStat
              label="Fees collected"
              value={formatMoney(data.financial.totalFeesPaid)}
              icon={Wallet}
            />
            <SchoolStat
              label="Outstanding balance"
              value={formatMoney(data.financial.totalBalance)}
              icon={TrendingUp}
            />
            <SchoolStat
              label="Online now"
              value={data.live.onlineTotal.toLocaleString()}
              icon={Wifi}
            />
            <SchoolStat
              label="Lessons completed today"
              value={data.live.lessonsCompletedToday.toLocaleString()}
              icon={GraduationCap}
            />
          </div>

          <SchoolPanel icon={BarChart3} title="Performance by grade">
            {data.byGrade.length === 0 ? (
              <SchoolEmpty
                icon={BarChart3}
                title="No grade data yet"
                description="Once students and fee records are added, per-grade metrics will appear here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#1a4d42]/10 dark:border-white/10">
                      <th className={`${thClass} text-left`}>Grade</th>
                      <th className={`${thClass} text-left`}>Curriculum</th>
                      <th className={`${thClass} text-right`}>Students</th>
                      <th className={`${thClass} text-right`}>Fees paid</th>
                      <th className={`${thClass} text-right`}>Balance</th>
                      <th className={`${thClass} text-right`}>Collection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byGrade.map((row) => {
                      const rate = collectionRate(row);
                      return (
                        <tr
                          key={row.gradeLevelId}
                          className="border-b border-[#1a4d42]/10 last:border-0 dark:border-white/10"
                        >
                          <td className="py-2.5 pr-3 font-medium text-[#0a1f1a] dark:text-white">
                            {row.gradeLevelName}
                          </td>
                          <td className="py-2.5 pr-3 text-[#1a4d42]/70 dark:text-white/60">
                            {row.curriculumName}
                          </td>
                          <td className="py-2.5 pr-3 text-right tabular-nums text-[#0a1f1a] dark:text-white">
                            {row.totalStudents.toLocaleString()}
                          </td>
                          <td className="py-2.5 pr-3 text-right tabular-nums text-[#0a1f1a] dark:text-white">
                            {formatMoney(row.totalFeesPaid)}
                          </td>
                          <td className="py-2.5 pr-3 text-right tabular-nums text-[#0a1f1a] dark:text-white">
                            {formatMoney(row.totalBalance)}
                          </td>
                          <td className="py-2.5 text-right">
                            {rate === null ? (
                              <span className="text-[#1a4d42]/45 dark:text-white/40">
                                —
                              </span>
                            ) : (
                              <Badge
                                variant="secondary"
                                className={collectionBadgeClass(rate)}
                              >
                                {Math.round(rate * 100)}%
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SchoolPanel>
        </>
      ) : null}
    </SchoolPage>
  );
}
