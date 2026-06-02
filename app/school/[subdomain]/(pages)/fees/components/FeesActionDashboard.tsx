"use client";

import {
  FileText,
  Plus,
  Receipt,
  Users,
  Eye,
  CreditCard,
  CheckCircle2,
  Circle,
  Send,
  Link2,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FEES_BRAND } from "../lib/fees-ui";

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  highlight?: boolean;
}

const QuickAction = ({
  icon,
  label,
  description,
  onClick,
  highlight,
}: QuickActionProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "group flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all",
      highlight
        ? "border-transparent text-white shadow-md hover:opacity-95"
        : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white hover:shadow-sm",
    )}
    style={
      highlight ? { backgroundColor: FEES_BRAND.primary } : undefined
    }
  >
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
        highlight
          ? "bg-white/15 text-white"
          : "bg-white text-slate-600 ring-1 ring-slate-200/80 group-hover:text-emerald-800",
      )}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <span
        className={cn(
          "block text-sm font-semibold",
          highlight ? "text-white" : "text-slate-900",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "mt-0.5 block text-xs leading-snug",
          highlight ? "text-white/75" : "text-slate-500",
        )}
      >
        {description}
      </span>
    </div>
  </button>
);

interface SetupRowProps {
  label: string;
  done: boolean;
  detail: string;
}

const SetupRow = ({ label, done, detail }: SetupRowProps) => (
  <li className="flex items-center justify-between gap-3 py-2">
    <div className="flex items-center gap-2 min-w-0">
      {done ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-slate-300" />
      )}
      <span className={cn("text-sm", done ? "text-slate-700" : "text-slate-500")}>
        {label}
      </span>
    </div>
    <span
      className={cn(
        "text-xs font-medium shrink-0",
        done ? "text-emerald-600" : "text-slate-400",
      )}
    >
      {detail}
    </span>
  </li>
);

interface FeesActionDashboardProps {
  onViewStructures: () => void;
  onCreateStructure: () => void;
  onGenerateInvoices: () => void;
  onViewInvoices: () => void;
  onViewAssignments: () => void;
  onAssignToGrade: () => void;
  onRecordPayment: () => void;
  onSendReminders?: () => void;
  stats?: {
    feeStructures?: number;
    students?: number;
    invoices?: number;
    totalRevenue?: string | number;
  };
  setupStatus?: {
    plansReady: boolean;
    classesLinked: boolean;
    billingStarted: boolean;
    planCount?: number;
    assignedClassCount?: number;
  };
}

export const FeesActionDashboard = ({
  onViewStructures,
  onCreateStructure,
  onGenerateInvoices,
  onViewInvoices,
  onViewAssignments,
  onAssignToGrade,
  onRecordPayment,
  onSendReminders,
  stats = {},
  setupStatus,
}: FeesActionDashboardProps) => {
  const {
    feeStructures = 0,
    students = 0,
    invoices = 0,
    totalRevenue = "0",
  } = stats;

  const revenue =
    typeof totalRevenue === "number"
      ? `KES ${totalRevenue.toLocaleString()}`
      : totalRevenue;

  const setupDone = [
    setupStatus?.plansReady,
    setupStatus?.classesLinked,
    setupStatus?.billingStarted,
  ].filter(Boolean).length;

  return (
    <div className="space-y-5 h-full flex flex-col">
      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm flex-1">
        <h2 className="text-sm font-semibold text-slate-900">Quick actions</h2>
        <p className="mt-0.5 mb-4 text-xs text-slate-500">
          Everyday bursar tasks
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <QuickAction
            icon={<CreditCard className="h-4 w-4" />}
            label="Record payment"
            description="Log cash, bank, or M-Pesa"
            onClick={onRecordPayment}
            highlight
          />
          <QuickAction
            icon={<Coins className="h-4 w-4" />}
            label="Bill students"
            description="Generate term invoices"
            onClick={onGenerateInvoices}
          />
          <QuickAction
            icon={<Plus className="h-4 w-4" />}
            label="New fee plan"
            description="Set charges per grade"
            onClick={onCreateStructure}
          />
          <QuickAction
            icon={<Users className="h-4 w-4" />}
            label="Apply to classes"
            description="Link plan to grades"
            onClick={onAssignToGrade}
          />
          <QuickAction
            icon={<Eye className="h-4 w-4" />}
            label="Student balances"
            description="Who owes & who paid"
            onClick={onViewInvoices}
          />
          <QuickAction
            icon={<FileText className="h-4 w-4" />}
            label="Fee plans"
            description="View or edit plans"
            onClick={onViewStructures}
          />
          <QuickAction
            icon={<Link2 className="h-4 w-4" />}
            label="Assignments"
            description="Who has a plan linked"
            onClick={onViewAssignments}
          />
          <QuickAction
            icon={<Receipt className="h-4 w-4" />}
            label="Invoices"
            description="Browse issued bills"
            onClick={onViewInvoices}
          />
          {onSendReminders && (
            <QuickAction
              icon={<Send className="h-4 w-4" />}
              label="Reminders"
              description="Notify families owing fees"
              onClick={onSendReminders}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Plans", value: feeStructures, icon: FileText },
          { label: "Students", value: students, icon: Users },
          { label: "Bills", value: invoices, icon: Receipt },
          { label: "Collected", value: revenue, icon: CreditCard },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-sm"
            >
              <div className="flex items-center gap-2 text-slate-400">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
              <p className="mt-1 truncate text-lg font-bold tabular-nums text-slate-900">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Setup checklist
          </h3>
          <span className="text-xs tabular-nums text-slate-400">
            {setupDone}/3
          </span>
        </div>
        <ul className="divide-y divide-slate-50">
          <SetupRow
            label="Fee plans"
            done={!!setupStatus?.plansReady}
            detail={
              setupStatus?.plansReady
                ? `${setupStatus?.planCount ?? feeStructures} ready`
                : "Pending"
            }
          />
          <SetupRow
            label="Classes linked"
            done={!!setupStatus?.classesLinked}
            detail={
              setupStatus?.classesLinked
                ? `${setupStatus?.assignedClassCount ?? "—"} linked`
                : "Pending"
            }
          />
          <SetupRow
            label="Billing started"
            done={!!setupStatus?.billingStarted}
            detail={setupStatus?.billingStarted ? "Active" : "Pending"}
          />
        </ul>
      </div>
    </div>
  );
};
