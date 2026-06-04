"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Percent,
  Gift,
  MinusCircle,
  MoreHorizontal,
  ShieldCheck,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FEES_BRAND, FEES_BTN } from "../lib/fees-ui";
import type { StudentSummaryDetail, FeeItem } from "../types";
import { formatCurrency } from "../utils";

export interface FeeAdjustmentForm {
  type: "discount" | "waiver" | "remove_charge" | "other";
  amount: string;
  reason: string;
  studentFeeItemId: string;
}

const ADJUSTMENT_TYPES = [
  {
    value: "discount" as const,
    label: "Discount",
    hint: "Reduce amount owed",
    icon: Percent,
  },
  {
    value: "waiver" as const,
    label: "Waiver",
    hint: "Scholarship / bursary",
    icon: Gift,
  },
  {
    value: "remove_charge" as const,
    label: "Remove charge",
    hint: "Drop a fee line",
    icon: MinusCircle,
  },
  {
    value: "other" as const,
    label: "Other",
    hint: "Custom adjustment",
    icon: MoreHorizontal,
  },
];

interface FeeAdjustmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentSummaryDetail | null;
  form: FeeAdjustmentForm;
  setForm: React.Dispatch<React.SetStateAction<FeeAdjustmentForm>>;
  onSubmit: () => void | Promise<void>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function FeeAdjustmentDrawer({
  isOpen,
  onClose,
  student,
  form,
  setForm,
  onSubmit,
  isSubmitting = false,
  submitError = null,
}: FeeAdjustmentDrawerProps) {
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) setFieldErrors([]);
  }, [isOpen]);

  const feeItems: FeeItem[] = student?.feeSummary?.feeItems ?? [];
  const unpaidItems = feeItems.filter((item) => {
    const paid = item.amountPaid ?? 0;
    const bal = item.balance ?? item.amount - paid;
    return bal > 0;
  });

  const balance = student?.feeSummary?.balance ?? 0;
  const amountNum = Number.parseFloat(form.amount);

  const validationMessages = useMemo(() => {
    const msgs: string[] = [];
    if (!student) msgs.push("Student profile is still loading. Wait a moment.");
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      msgs.push("Enter an adjustment amount greater than zero.");
    }
    if (form.reason.trim().length < 3) {
      msgs.push("Reason must be at least 3 characters.");
    }
    return msgs;
  }, [student, amountNum, form.reason]);

  const handleApply = async () => {
    if (isSubmitting) return;
    if (validationMessages.length > 0) {
      setFieldErrors(validationMessages);
      return;
    }
    setFieldErrors([]);
    await onSubmit();
  };

  const noUnpaidLines =
    !!student && unpaidItems.length === 0 && balance <= 0;

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction="right"
    >
      <DrawerContent className="flex h-full max-h-[100dvh] w-full max-w-md flex-col border-l p-0">
        <DrawerHeader className="shrink-0 border-b border-slate-100 px-4 py-4 text-left">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <DrawerTitle className="text-lg font-bold text-slate-900">
                Log fee adjustment
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-xs">
                {student ? (
                  <>
                    <span className="font-medium text-slate-800">
                      {student.studentName}
                    </span>
                    {" · "}
                    {student.admissionNumber}
                  </>
                ) : (
                  "Loading student…"
                )}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
          {student ? (
            <p className="mt-2 text-sm tabular-nums">
              <span className="text-slate-500">Balance due </span>
              <span
                className={cn(
                  "font-bold",
                  balance > 0 ? "text-rose-700" : "text-emerald-700",
                )}
              >
                {formatCurrency(balance)}
              </span>
            </p>
          ) : null}
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-3 py-2 text-[11px] leading-relaxed text-emerald-900">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Credits fee lines and open invoices. Saved to the audit trail.
          </div>

          {noUnpaidLines ? (
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              No unpaid fee lines on this profile. You can still try to apply —
              the server will confirm whether billing exists.
            </div>
          ) : null}

          {(fieldErrors.length > 0 || submitError) && (
            <div
              className="mb-4 space-y-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950"
              role="alert"
            >
              {submitError ? <p>{submitError}</p> : null}
              {fieldErrors.map((msg) => (
                <p key={msg}>• {msg}</p>
              ))}
            </div>
          )}

          <div className="space-y-5">
            <section className="space-y-2">
              <Label>Adjustment type</Label>
              <div className="grid grid-cols-2 gap-2">
                {ADJUSTMENT_TYPES.map(({ value, label, hint, icon: Icon }) => {
                  const selected = form.type === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, type: value }))
                      }
                      className={cn(
                        "rounded-xl border p-2.5 text-left transition-colors",
                        selected
                          ? "border-primary bg-[#e8f2ef] ring-2 ring-primary/25"
                          : "border-slate-200 bg-white hover:bg-slate-50",
                      )}
                    >
                      <Icon className="h-4 w-4 text-slate-600" />
                      <p className="mt-1 text-xs font-semibold text-slate-900">
                        {label}
                      </p>
                      <p className="text-[10px] text-slate-500">{hint}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-2">
              <Label htmlFor="adj-amount">Amount (KES)</Label>
              <Input
                id="adj-amount"
                type="number"
                min={0}
                step="1"
                inputMode="decimal"
                className="h-10"
                value={form.amount}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, amount: e.target.value }))
                }
                placeholder="e.g. 5000"
              />
            </section>

            {unpaidItems.length > 0 ? (
              <section className="space-y-2">
                <Label>Apply to (optional)</Label>
                <Select
                  value={form.studentFeeItemId || "all"}
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      studentFeeItemId: v === "all" ? "" : v,
                    }))
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Oldest balances first" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      Oldest balances first (FIFO)
                    </SelectItem>
                    {unpaidItems.map((item) => {
                      const itemBalance =
                        item.balance ??
                        item.amount - (item.amountPaid ?? 0);
                      return (
                        <SelectItem key={item.id} value={item.id}>
                          {item.feeBucketName} — {formatCurrency(itemBalance)}{" "}
                          due
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </section>
            ) : null}

            <section className="space-y-2">
              <Label htmlFor="adj-reason">
                Reason <span className="text-rose-600">*</span>
              </Label>
              <Textarea
                id="adj-reason"
                rows={3}
                className="resize-none"
                value={form.reason}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="e.g. Bursary approved by board, Term 1 only"
              />
              <p className="text-[11px] text-slate-500">
                {form.reason.trim().length}/3 characters minimum
              </p>
            </section>
          </div>
        </div>

        <DrawerFooter className="shrink-0 gap-2 border-t border-slate-100 bg-white px-4 py-3">
          <Button
            type="button"
            className={cn(FEES_BTN.primary, "h-11 w-full gap-2")}
            style={
              !isSubmitting
                ? { backgroundColor: FEES_BRAND.primary }
                : undefined
            }
            disabled={isSubmitting}
            onClick={() => void handleApply()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Applying…
              </>
            ) : (
              "Apply adjustment"
            )}
          </Button>
          <DrawerClose asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(FEES_BTN.secondary, "w-full")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
