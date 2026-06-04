import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentSummaryDetail } from "../types";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudentFeeLedger } from "./studentProfile/StudentFeeLedger";

interface FeeSummaryCardProps {
  studentData: StudentSummaryDetail | null;
  loading: boolean;
  error: string | null;
  /** Drawer summary tab — table only, stats live in drawer header. */
  variant?: "default" | "embedded";
}

function formatKes(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

export const FeeSummaryCard: React.FC<FeeSummaryCardProps> = ({
  studentData,
  loading,
  error,
  variant = "default",
}) => {
  const embedded = variant === "embedded";
  const feeSummary = studentData?.feeSummary;
  const feeItems = feeSummary?.feeItems ?? [];

  if (loading) {
    return (
      <Card className={cn(embedded && "border-0 shadow-none")}>
        {!embedded ? (
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="h-4 w-4" />
              Fee summary
            </CardTitle>
          </CardHeader>
        ) : null}
        <CardContent className={embedded ? "p-0" : undefined}>
          <div className="animate-pulse space-y-3">
            <div className="h-10 rounded-lg bg-slate-100" />
            <div className="h-24 rounded-lg bg-slate-100" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-rose-600">{error}</p>
    );
  }

  if (!feeSummary) {
    return (
      <p className="text-sm text-slate-500">No fee data for this student.</p>
    );
  }

  const itemCount =
    feeSummary.numberOfFeeItems ?? feeItems.length;

  if (embedded) {
    return <StudentFeeLedger items={feeItems} />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Fee summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <OverviewStat label="Total owed" value={formatKes(feeSummary.totalOwed)} />
          <OverviewStat label="Total paid" value={formatKes(feeSummary.totalPaid)} />
          <OverviewStat label="Balance" value={formatKes(feeSummary.balance)} />
          <OverviewStat label="Fee items" value={String(itemCount)} />
        </div>
        <FeeItemsTable items={feeItems} compact={false} />
      </CardContent>
    </Card>
  );
};

function OverviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 px-3 py-2 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  );
}

type FeeItemRow = {
  id: string;
  feeBucketName: string;
  amount: number;
  isMandatory: boolean;
  feeStructureName?: string;
  academicYearName?: string;
};

function FeeItemsTable({
  items,
  compact,
}: {
  items: FeeItemRow[];
  compact: boolean;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-500">
        No fee line items on record.
      </p>
    );
  }

  const grouped = items.reduce<Record<string, FeeItemRow[]>>((acc, item) => {
    const key = [item.feeStructureName, item.academicYearName]
      .filter(Boolean)
      .join(" · ") || "Fees";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([groupLabel, groupItems]) => (
        <div
          key={groupLabel}
          className="overflow-hidden rounded-lg border border-slate-200/80"
        >
          <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-1.5">
            <p className="text-[11px] font-semibold text-slate-700">
              {groupLabel}
            </p>
          </div>
          <table className="w-full text-sm">
            <thead className="sr-only">
              <tr>
                <th>Item</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {groupItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-100 first:border-t-0"
                >
                  <td className="min-w-0 px-3 py-2">
                    <p className="font-medium text-slate-900">
                      {item.feeBucketName}
                    </p>
                    {!compact && !item.isMandatory ? (
                      <Badge variant="outline" className="mt-1 text-[10px]">
                        Optional
                      </Badge>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums font-medium text-slate-900">
                    {formatKes(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
