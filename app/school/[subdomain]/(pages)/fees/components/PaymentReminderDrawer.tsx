"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { PaymentReminderForm, StudentSummaryFromAPI } from "../types";
import { ChevronLeft } from "lucide-react";
import { FEES_BRAND } from "../lib/fees-ui";

interface PaymentReminderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  form: PaymentReminderForm;
  setForm: React.Dispatch<React.SetStateAction<PaymentReminderForm>>;
  onSubmit: (filteredStudentIds?: string[]) => void;
  students?: StudentSummaryFromAPI[];
}

const defaultMessage = (name: string, balance: number) =>
  `Dear parent/guardian, this is a reminder that fees for ${name} have an outstanding balance of KES ${balance.toLocaleString()}. Please arrange payment before the deadline. Thank you.`;

const bulkMessage = (count: number, totalBalance: number) =>
  `Dear parent/guardian, this is a reminder regarding outstanding school fees (${count} student${count !== 1 ? "s" : ""}, total KES ${totalBalance.toLocaleString()}). Please arrange payment before the deadline. Thank you.`;

export default function PaymentReminderDrawer({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  students = [],
}: PaymentReminderDrawerProps) {
  const [step, setStep] = useState<"compose" | "preview">("compose");
  const [minBalance, setMinBalance] = useState("0");

  useEffect(() => {
    if (isOpen) setStep("compose");
  }, [isOpen]);

  const selectedStudents = useMemo(
    () => students.filter((s) => form.studentIds.includes(s.id)),
    [students, form.studentIds],
  );

  const filteredByBalance = useMemo(() => {
    const min = Number(minBalance) || 0;
    return selectedStudents.filter((s) => s.feeSummary.balance >= min);
  }, [selectedStudents, minBalance]);

  const totalBalance = filteredByBalance.reduce(
    (sum, s) => sum + s.feeSummary.balance,
    0,
  );

  const applyTemplate = () => {
    if (filteredByBalance.length === 1) {
      const s = filteredByBalance[0];
      setForm((prev) => ({
        ...prev,
        message: defaultMessage(s.studentName, s.feeSummary.balance),
      }));
      return;
    }
    if (filteredByBalance.length > 1) {
      setForm((prev) => ({
        ...prev,
        message: bulkMessage(filteredByBalance.length, totalBalance),
      }));
    }
  };

  const handleClose = () => {
    setStep("compose");
    onClose();
  };

  const handleConfirmSend = () => {
    const ids = filteredByBalance.map((s) => s.id);
    setForm((prev) => ({ ...prev, studentIds: ids }));
    onSubmit(ids);
    setStep("compose");
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      direction="right"
    >
      <DrawerContent className="flex h-full max-h-[100dvh] w-full max-w-md flex-col">
        <DrawerHeader className="shrink-0 border-b border-slate-100 text-left">
          <DrawerTitle>
            {step === "compose" ? "Send fee reminder" : "Preview recipients"}
          </DrawerTitle>
          <DrawerDescription>
            {step === "compose"
              ? "Filter, write your message, then preview who will be contacted."
              : `${filteredByBalance.length} famil${filteredByBalance.length !== 1 ? "ies" : "y"} will receive this reminder.`}
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {step === "compose" ? (
            <>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {form.studentIds.length === 0 ? (
                  <span>Select students from the balances list first.</span>
                ) : (
                  <span>
                    <strong className="text-slate-900">
                      {form.studentIds.length}
                    </strong>{" "}
                    student{form.studentIds.length !== 1 ? "s" : ""} selected
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-balance">Minimum balance (KES)</Label>
                <Input
                  id="min-balance"
                  type="number"
                  min={0}
                  value={minBalance}
                  onChange={(e) => setMinBalance(e.target.value)}
                  placeholder="0 = all selected"
                />
                <p className="text-xs text-slate-500">
                  {filteredByBalance.length} of {selectedStudents.length} will
                  be messaged after this filter.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Channel</Label>
                <Select
                  value={form.reminderType}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, reminderType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="reminder-message">Message</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto shrink-0 px-2 text-xs"
                    onClick={applyTemplate}
                    disabled={filteredByBalance.length === 0}
                  >
                    Use template
                  </Button>
                </div>
                <Textarea
                  id="reminder-message"
                  rows={6}
                  value={form.message}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, message: e.target.value }))
                  }
                  placeholder="Include student name, balance, and payment deadline."
                />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="include-invoice"
                  checked={form.includeInvoiceDetails}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      includeInvoiceDetails: checked === true,
                    }))
                  }
                />
                <Label htmlFor="include-invoice" className="font-normal leading-snug">
                  Include bill details in the message
                </Label>
              </div>
            </>
          ) : (
            <>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
                {filteredByBalance.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500">
                    No students match your filters.
                  </p>
                ) : (
                  filteredByBalance.map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between gap-3 px-3 py-2.5 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {s.studentName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {s.admissionNumber} · {s.gradeLevelName}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold tabular-nums text-rose-700">
                        KES {s.feeSummary.balance.toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {form.message.trim() ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-700">
                  {form.message}
                </div>
              ) : null}
            </>
          )}
        </div>

        <DrawerFooter className="shrink-0 flex-row gap-2 border-t border-slate-100">
          {step === "preview" ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("compose")}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <Button
                className="flex-1 text-white"
                style={{ backgroundColor: FEES_BRAND.primary }}
                onClick={handleConfirmSend}
                disabled={filteredByBalance.length === 0}
              >
                Confirm & queue
              </Button>
            </>
          ) : (
            <>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                className="flex-1 text-white"
                style={{ backgroundColor: FEES_BRAND.primary }}
                onClick={() => setStep("preview")}
                disabled={
                  filteredByBalance.length === 0 || !form.message.trim()
                }
              >
                Preview & send
              </Button>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
