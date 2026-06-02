"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
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
import type { StudentSummaryDetail, FeeItem } from "../types";
import { formatCurrency } from "../utils";

export interface FeeAdjustmentForm {
  type: "discount" | "waiver" | "remove_charge" | "other";
  amount: string;
  reason: string;
  studentFeeItemId: string;
}

interface FeeAdjustmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentSummaryDetail | null;
  form: FeeAdjustmentForm;
  setForm: React.Dispatch<React.SetStateAction<FeeAdjustmentForm>>;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function FeeAdjustmentDrawer({
  isOpen,
  onClose,
  student,
  form,
  setForm,
  onSubmit,
  isSubmitting = false,
}: FeeAdjustmentDrawerProps) {
  const feeItems: FeeItem[] = student?.feeSummary.feeItems ?? [];
  const unpaidItems = feeItems.filter(
    (item) => (item.balance ?? item.amount - (item.amountPaid ?? 0)) > 0,
  );

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Log fee adjustment</DrawerTitle>
          <DrawerDescription>
            {student
              ? `${student.studentName} · ${student.admissionNumber}`
              : "Record a discount, waiver, or fee change for audit purposes."}
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 px-4 pb-2">
          <p className="text-xs text-slate-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            Adjustments update the student&apos;s billed balance immediately and
            are stored in an immutable audit trail linked to your account.
          </p>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={form.type}
              onValueChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  type: v as FeeAdjustmentForm["type"],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount">Discount</SelectItem>
                <SelectItem value="waiver">Waiver / scholarship</SelectItem>
                <SelectItem value="remove_charge">
                  Remove charge (e.g. transport)
                </SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {unpaidItems.length > 0 && (
            <div className="space-y-2">
              <Label>Apply to fee item (optional)</Label>
              <Select
                value={form.studentFeeItemId || "all"}
                onValueChange={(v) =>
                  setForm((prev) => ({
                    ...prev,
                    studentFeeItemId: v === "all" ? "" : v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Oldest balances first (FIFO)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Oldest balances first (FIFO)</SelectItem>
                  {unpaidItems.map((item) => {
                    const balance =
                      item.balance ??
                      item.amount - (item.amountPaid ?? 0);
                    return (
                      <SelectItem key={item.id} value={item.id}>
                        {item.feeBucketName} · {item.feeStructureName} —{" "}
                        {formatCurrency(balance)} due
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="adj-amount">Amount (KES)</Label>
            <Input
              id="adj-amount"
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="e.g. 5000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adj-reason">Reason (required)</Label>
            <Textarea
              id="adj-reason"
              rows={4}
              value={form.reason}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, reason: e.target.value }))
              }
              placeholder="e.g. Bursary approved by board, Term 1 only"
            />
          </div>
        </div>

        <DrawerFooter className="flex-row gap-2">
          <DrawerClose asChild>
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
          </DrawerClose>
          <Button
            className="flex-1"
            onClick={onSubmit}
            disabled={!form.reason.trim() || !form.amount || isSubmitting}
          >
            {isSubmitting ? "Applying…" : "Apply adjustment"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
