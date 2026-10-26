"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
import { Check, ChevronLeft, Copy, ExternalLink, Link2, Sparkles, Tag } from "lucide-react";
import { FEES_BRAND } from "../lib/fees-ui";

interface PaymentReminderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  form: PaymentReminderForm;
  setForm: React.Dispatch<React.SetStateAction<PaymentReminderForm>>;
  onSubmit: (filteredStudentIds?: string[]) => void;
  students?: StudentSummaryFromAPI[];
}

type ReminderTemplate = {
  id: string;
  label: string;
  hint: string;
  body: string;
};

const REMINDER_TEMPLATES: ReminderTemplate[] = [
  {
    id: "friendly",
    label: "Friendly",
    hint: "Warm nudge",
    body: `Dear parent/guardian,

A friendly reminder that fees for {{student_name}} ({{grade}}) have an outstanding balance of {{balance}}.

You can view the statement and pay securely here:
{{payment_link}}

Thank you,
The school finance office`,
  },
  {
    id: "urgent",
    label: "Urgent",
    hint: "Needs action",
    body: `Dear parent/guardian,

This is a reminder that {{student_name}} ({{grade}}) has an outstanding fee balance of {{balance}}.

Please pay, or reply to arrange a plan, as soon as possible:
{{payment_link}}

Thank you.`,
  },
  {
    id: "final",
    label: "Final notice",
    hint: "Firm, last call",
    body: `Dear parent/guardian,

Our records show an outstanding balance of {{balance}} for {{student_name}} ({{grade}}).

Please settle it or contact the school office this week:
{{payment_link}}

Thank you.`,
  },
  {
    id: "plan",
    label: "Payment plan",
    hint: "Offer installments",
    body: `Dear parent/guardian,

{{student_name}} ({{grade}}) has an outstanding balance of {{balance}}. If paying in full is difficult, reply and we can arrange a payment plan.

View the statement and pay here:
{{payment_link}}

Thank you.`,
  },
];

const REMINDER_TAGS = [
  { label: "Student", token: "{{student_name}}" },
  { label: "Grade", token: "{{grade}}" },
  { label: "Balance", token: "{{balance}}" },
  { label: "Admission no.", token: "{{admission_number}}" },
  { label: "Payment link", token: "{{payment_link}}" },
];

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
  const [copiedLink, setCopiedLink] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const portalLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/parent?tab=payments`
      : "";

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

  const paymentLink =
    form.paymentLink !== undefined ? form.paymentLink : portalLink;
  const sampleStudent = filteredByBalance[0];

  const renderMessage = (
    template: string,
    student?: StudentSummaryFromAPI,
  ) => {
    const balance = student
      ? `KES ${student.feeSummary.balance.toLocaleString()}`
      : "the outstanding balance";
    return template
      .replaceAll("{{student_name}}", student?.studentName ?? "your child")
      .replaceAll("{{grade}}", student?.gradeLevelName ?? "your child’s grade")
      .replaceAll("{{balance}}", balance)
      .replaceAll(
        "{{admission_number}}",
        student?.admissionNumber ?? "on file",
      )
      .replaceAll("{{payment_link}}", paymentLink.trim() || "[payment link]");
  };

  const previewMessage = renderMessage(form.message, sampleStudent);

  const applyTemplate = (body: string) => {
    setForm((prev) => ({ ...prev, message: body }));
  };

  const insertTag = (token: string) => {
    const textarea = messageRef.current;
    if (!textarea) {
      setForm((prev) => ({ ...prev, message: `${prev.message}${token}` }));
      return;
    }
    const start = textarea.selectionStart ?? form.message.length;
    const end = textarea.selectionEnd ?? start;
    const next =
      form.message.slice(0, start) + token + form.message.slice(end);
    setForm((prev) => ({ ...prev, message: next }));
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const copyPaymentLink = async () => {
    if (!paymentLink.trim() || typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(paymentLink.trim());
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 1500);
    } catch {
      setCopiedLink(false);
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
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#246a59]" />
                  <Label>Start from a template</Label>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {REMINDER_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => applyTemplate(template.body)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left transition-all hover:border-[#246a59]/35 hover:bg-[#f3f9f6] active:scale-[0.99]"
                    >
                      <span className="block text-[11px] font-semibold text-slate-900">
                        {template.label}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {template.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-end justify-between gap-2">
                  <Label htmlFor="reminder-message">Message</Label>
                  <span className="text-[10px] text-slate-400">
                    Tags fill in per student
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {REMINDER_TAGS.map((tag) => (
                    <button
                      key={tag.token}
                      type="button"
                      onClick={() => insertTag(tag.token)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 transition-colors hover:border-[#246a59]/30 hover:bg-[#e8f2ef] hover:text-[#1a4d42]"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag.label}
                    </button>
                  ))}
                </div>
                <Textarea
                  ref={messageRef}
                  id="reminder-message"
                  rows={7}
                  value={form.message}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, message: e.target.value }))
                  }
                  placeholder="Write your reminder, or start with a template above. Use tags for the student name, balance, and payment link."
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="reminder-link">Payment link</Label>
                  <button
                    type="button"
                    onClick={() => void copyPaymentLink()}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#246a59] hover:underline"
                  >
                    {copiedLink ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copiedLink ? "Copied" : "Copy"}
                  </button>
                </div>
                <Input
                  id="reminder-link"
                  value={paymentLink}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      paymentLink: e.target.value,
                    }))
                  }
                  placeholder="https://your-school.squl.co.ke/parent?tab=payments"
                  className="font-mono text-[11px]"
                />
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                  <a
                    href={paymentLink || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#246a59] hover:underline"
                  >
                    <Link2 className="h-3 w-3" />
                    Open link
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                  <span>
                    Parents sign in, see the balance, and pay. Insert it in the
                    message with the Payment link tag.
                  </span>
                </div>
              </div>

              {form.message.trim() && sampleStudent ? (
                <div className="rounded-lg border border-[#1a4d42]/12 bg-[#f8fbfa] p-3">
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#1a4d42]/45">
                    Sample for {sampleStudent.studentName}
                  </p>
                  <div className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-700">
                    {previewMessage}
                  </div>
                </div>
              ) : null}

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
                <div className="rounded-lg border border-[#1a4d42]/12 bg-[#f8fbfa] p-3">
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#1a4d42]/45">
                    Preview for{" "}
                    {sampleStudent?.studentName ?? "the first recipient"}
                  </p>
                  <div className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-700">
                    {previewMessage}
                  </div>
                  {paymentLink.trim() ? (
                    <a
                      href={paymentLink.trim()}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#246a59] hover:underline"
                    >
                      <Link2 className="h-3 w-3" />
                      {paymentLink.trim()}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  ) : null}
                  <p className="mt-1 text-[9px] text-[#1a4d42]/45">
                    Tags are filled per recipient when the reminder is queued.
                  </p>
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
