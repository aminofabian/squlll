"use client";

import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import type { PaymentReminderForm, StudentSummaryFromAPI } from "../types";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
  Mail,
  MessageCircle,
  MessageSquare,
  Send,
  Sparkles,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentReminderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  form: PaymentReminderForm;
  setForm: React.Dispatch<React.SetStateAction<PaymentReminderForm>>;
  onSubmit: (filteredStudentIds?: string[]) => void;
  students?: StudentSummaryFromAPI[];
  nextTermName?: string;
  nextTermFeesByGrade?: Record<string, number>;
}

type ReminderStep = "audience" | "compose" | "review";
type ReminderChannel = "sms" | "email" | "whatsapp";

type ReminderTemplate = {
  id: string;
  label: string;
  hint: string;
  tone: "emerald" | "sky" | "amber" | "slate";
  body: string;
};

const STEPS: Array<{
  id: ReminderStep;
  label: string;
  title: string;
  description: string;
}> = [
  {
    id: "audience",
    label: "Audience",
    title: "Who gets this reminder?",
    description: "Choose the families, channel, and minimum balance.",
  },
  {
    id: "compose",
    label: "Message",
    title: "Craft the reminder",
    description: "Start from a template, then make it sound like your school.",
  },
  {
    id: "review",
    label: "Review",
    title: "Ready to send?",
    description: "Check the wording, the link, and exactly who receives it.",
  },
];

const CHANNELS: Array<{
  id: ReminderChannel;
  label: string;
  hint: string;
  icon: typeof MessageSquare;
}> = [
  { id: "sms", label: "SMS", hint: "Plain text", icon: MessageSquare },
  { id: "email", label: "Email", hint: "Keeps bold", icon: Mail },
  { id: "whatsapp", label: "WhatsApp", hint: "Plain text", icon: MessageCircle },
];

const REMINDER_TEMPLATES: ReminderTemplate[] = [
  {
    id: "balance",
    label: "Balance reminder",
    hint: "Friendly, with link",
    tone: "emerald",
    body: `Dear Parent/Guardian,

This is a friendly reminder that {{student_name}} ({{grade}}) has an outstanding school fee balance of KES {{balance}}.

Kindly make the payment at your earliest convenience using the link below:

{{payment_link}}

You can view the fee breakdown and payment details through the link.

If you have already made the payment, please disregard this reminder. For any questions or assistance, kindly contact the school office.

Thank you for your continued support.

School Administration`,
  },
  {
    id: "next-term",
    label: "Next term",
    hint: "Back-to-school",
    tone: "sky",
    body: `Dear Parent/Guardian,

As we prepare for {{next_term}}, kindly arrange payment of the school fees for {{student_name}} in {{grade}}.

The fees for the upcoming term are KES {{next_term_fees}}.

You can view the fee details and make your payment using the link below:

{{payment_link}}

We encourage you to make payments early to ensure a smooth start to the new term.

Thank you for your continued support.

Kind regards,
School Administration`,
  },
  {
    id: "next-term-bold",
    label: "Next term · bold",
    hint: "Email emphasis",
    tone: "sky",
    body: `Dear Parent/Guardian,

As we prepare for **{{next_term}}**, kindly arrange payment of the school fees for **{{student_name}}** in {{grade}}.

The fees for the upcoming term are **KES {{next_term_fees}}**.

You can view the fee details and make your payment using the link below:

{{payment_link}}

We encourage you to make payments early to ensure a smooth start to the new term.

Thank you for your continued support.

Kind regards,  
**School Administration**`,
  },
  {
    id: "urgent",
    label: "Urgent",
    hint: "Needs action",
    tone: "amber",
    body: `Dear Parent/Guardian,

This is a reminder that {{student_name}} ({{grade}}) has an outstanding fee balance of KES {{balance}}.

Please pay, or reply to arrange a plan, as soon as possible:
{{payment_link}}

Thank you.`,
  },
  {
    id: "plan",
    label: "Payment plan",
    hint: "Offer installments",
    tone: "slate",
    body: `Dear Parent/Guardian,

{{student_name}} ({{grade}}) has an outstanding balance of KES {{balance}}. If paying in full is difficult, reply and we can arrange a payment plan.

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
  { label: "Next term", token: "{{next_term}}" },
  { label: "Next term fees", token: "{{next_term_fees}}" },
  { label: "Payment link", token: "{{payment_link}}" },
];

const TONE_STYLES: Record<ReminderTemplate["tone"], string> = {
  emerald: "border-emerald-200/80 bg-emerald-50/60",
  sky: "border-sky-200/80 bg-sky-50/60",
  amber: "border-amber-200/80 bg-amber-50/60",
  slate: "border-slate-200/80 bg-slate-50/60",
};

function MessageBody({
  text,
  formatBold = true,
  className,
}: {
  text: string;
  formatBold?: boolean;
  className?: string;
}) {
  const value = formatBold ? text : text.replace(/\*\*/g, "");
  const parts = value.split(/(\*\*[^*]+\*\*)/g);

  return (
    <div className={cn("whitespace-pre-wrap", className)}>
      {parts.map((part, index) =>
        formatBold && part.startsWith("**") && part.endsWith("**") ? (
          <strong key={index} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  icon: typeof Users;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
        <div className="flex min-w-0 items-start gap-2">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#e8f2ef] text-[#1a4d42]">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-900">{title}</h3>
            {description ? (
              <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-3.5">{children}</div>
    </section>
  );
}

function MiniMetric({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string;
  tone?: "slate" | "emerald" | "rose" | "sky";
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 px-2.5 py-2">
      <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 truncate text-sm font-semibold tabular-nums",
          tone === "emerald" && "text-emerald-800",
          tone === "rose" && "text-rose-800",
          tone === "sky" && "text-sky-800",
          tone === "slate" && "text-slate-900",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function StepRail({
  current,
  onSelect,
}: {
  current: ReminderStep;
  onSelect: (step: ReminderStep) => void;
}) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <nav
      aria-label="Reminder steps"
      className="mt-3 flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1"
    >
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <button
            key={step.id}
            type="button"
            disabled={index > currentIndex}
            onClick={() => onSelect(step.id)}
            aria-current={active ? "step" : undefined}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-all",
              active
                ? "bg-white text-[#0a1f1a] shadow-sm"
                : done
                  ? "text-[#246a59] hover:bg-white/70"
                  : "text-slate-400",
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full text-[8px]",
                done
                  ? "bg-[#246a59] text-white"
                  : active
                    ? "bg-[#0a1f1a] text-white"
                    : "border border-slate-300 bg-white text-slate-400",
              )}
            >
              {done ? <Check className="h-2.5 w-2.5" /> : index + 1}
            </span>
            {step.label}
          </button>
        );
      })}
    </nav>
  );
}

function RecipientList({
  students,
  max = 6,
}: {
  students: StudentSummaryFromAPI[];
  max?: number;
}) {
  if (students.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-slate-500">
        No students match this audience.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {students.slice(0, max).map((student) => {
        const initials = student.studentName
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase())
          .join("");
        return (
          <li key={student.id} className="flex items-center gap-2 py-1.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#1a4d42]/10 bg-[#f1f6f3] text-[9px] font-bold text-[#246a59]">
              {initials || "S"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-slate-900">
                {student.studentName}
              </p>
              <p className="truncate text-[9px] text-slate-500">
                {student.admissionNumber} · {student.gradeLevelName}
              </p>
            </div>
            <p className="shrink-0 text-[10px] font-semibold tabular-nums text-rose-700">
              KES {student.feeSummary.balance.toLocaleString()}
            </p>
          </li>
        );
      })}
      {students.length > max ? (
        <li className="pt-2 text-center text-[9px] text-slate-400">
          +{students.length - max} more recipient
          {students.length - max === 1 ? "" : "s"}
        </li>
      ) : null}
    </ul>
  );
}

export default function PaymentReminderDrawer({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  students = [],
  nextTermName,
  nextTermFeesByGrade = {},
}: PaymentReminderDrawerProps) {
  const [step, setStep] = useState<ReminderStep>("compose");
  const [minBalance, setMinBalance] = useState("0");
  const [copiedLink, setCopiedLink] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const prefilledRef = useRef(false);
  const portalLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/parent?tab=payments`
      : "";

  useEffect(() => {
    if (!isOpen) {
      prefilledRef.current = false;
      return;
    }
    setStep(form.studentIds.length > 0 ? "compose" : "audience");
    if (!prefilledRef.current) {
      prefilledRef.current = true;
      if (!form.message.trim()) {
        setForm((prev) => ({
          ...prev,
          message: REMINDER_TEMPLATES[0].body,
        }));
      }
    }
  }, [isOpen, form.message, form.studentIds.length, setForm]);

  const selectedStudents = useMemo(
    () => students.filter((student) => form.studentIds.includes(student.id)),
    [students, form.studentIds],
  );

  const filteredByBalance = useMemo(() => {
    const min = Number(minBalance) || 0;
    return selectedStudents.filter((student) => student.feeSummary.balance >= min);
  }, [selectedStudents, minBalance]);

  const totalBalance = filteredByBalance.reduce(
    (sum, student) => sum + student.feeSummary.balance,
    0,
  );

  const paymentLink =
    form.paymentLink !== undefined ? form.paymentLink : portalLink;
  const sampleStudent = filteredByBalance[0];
  const channel =
    CHANNELS.find((item) => item.id === form.reminderType) ?? CHANNELS[0];

  const nextTermFeeFor = (gradeLevelName?: string) => {
    if (!gradeLevelName) return undefined;
    if (nextTermFeesByGrade[gradeLevelName] != null) {
      return nextTermFeesByGrade[gradeLevelName];
    }
    const match = Object.entries(nextTermFeesByGrade).find(
      ([grade]) =>
        gradeLevelName.includes(grade) || grade.includes(gradeLevelName),
    );
    return match?.[1];
  };

  const renderMessage = (
    template: string,
    student?: StudentSummaryFromAPI,
  ) => {
    const balance = student
      ? student.feeSummary.balance.toLocaleString()
      : "[amount]";
    const upcomingFee = nextTermFeeFor(student?.gradeLevelName);
    return template
      .replaceAll("{{student_name}}", student?.studentName ?? "your child")
      .replaceAll("{{grade}}", student?.gradeLevelName ?? "your child’s grade")
      .replaceAll("{{balance}}", balance)
      .replaceAll(
        "{{admission_number}}",
        student?.admissionNumber ?? "on file",
      )
      .replaceAll(
        "{{next_term}}",
        nextTermName?.trim() || "the next term",
      )
      .replaceAll(
        "{{next_term_fees}}",
        upcomingFee != null ? upcomingFee.toLocaleString() : "[amount]",
      )
      .replaceAll("{{payment_link}}", paymentLink.trim() || "[payment link]");
  };

  const previewMessage = renderMessage(form.message, sampleStudent);
  const plainPreview = previewMessage.replace(/\*\*/g, "");
  const previewText =
    form.reminderType === "email" ? previewMessage : plainPreview;
  const characterCount = plainPreview.length;
  const smsSegments = Math.max(1, Math.ceil(characterCount / 160));

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
    const ids = filteredByBalance.map((student) => student.id);
    setForm((prev) => ({ ...prev, studentIds: ids }));
    onSubmit(ids);
    setStep("compose");
  };

  const goTo = (next: ReminderStep) => {
    const nextIndex = STEPS.findIndex((item) => item.id === next);
    const currentIndex = STEPS.findIndex((item) => item.id === step);
    if (nextIndex <= currentIndex) setStep(next);
  };

  const meta = STEPS.find((item) => item.id === step) ?? STEPS[1];
  const canReview = filteredByBalance.length > 0 && form.message.trim().length > 0;

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      direction="right"
    >
      <DrawerContent className="flex h-full max-h-[100dvh] w-full max-w-4xl flex-col border-l border-[#1a4d42]/12 bg-[#f8fbfa] p-0 sm:max-w-4xl">
        <DrawerHeader className="shrink-0 border-b border-[#1a4d42]/10 bg-white px-5 pb-3 pt-5 pr-12 text-left">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#246a59]">
                <Sparkles className="h-3 w-3" />
                Fee reminders
              </p>
              <DrawerTitle className="mt-1 font-display text-xl tracking-tight text-[#0a1f1a]">
                {meta.title}
              </DrawerTitle>
              <DrawerDescription className="mt-0.5 max-w-xl text-[11px] leading-relaxed text-slate-500">
                {meta.description}
              </DrawerDescription>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#1a4d42]/12 bg-[#f8fbfa] px-2.5 py-1 text-[10px] font-semibold text-[#1a4d42]/70">
              <Users className="h-3 w-3" />
              {filteredByBalance.length} famil
              {filteredByBalance.length === 1 ? "y" : "ies"}
            </div>
          </div>
          <StepRail current={step} onSelect={goTo} />
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="grid h-full min-h-0 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-5">
              {step === "audience" ? (
                <div className="space-y-3">
                  <SectionCard
                    icon={Users}
                    title="Audience"
                    description="Only families in this list will receive the reminder."
                    action={
                      <span className="rounded-full bg-[#e8f2ef] px-2 py-0.5 text-[9px] font-bold text-[#1a4d42]">
                        {filteredByBalance.length} ready
                      </span>
                    }
                  >
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <MiniMetric label="Selected" value={String(selectedStudents.length)} />
                      <MiniMetric label="Will receive" value={String(filteredByBalance.length)} tone="emerald" />
                      <MiniMetric label="Total balance" value={`KES ${totalBalance.toLocaleString()}`} tone="rose" />
                      <MiniMetric label="Channel" value={channel.label} tone="sky" />
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <Label htmlFor="min-balance" className="text-[11px]">
                        Minimum balance (KES)
                      </Label>
                      <Input
                        id="min-balance"
                        type="number"
                        min={0}
                        value={minBalance}
                        onChange={(event) => setMinBalance(event.target.value)}
                        placeholder="0 = everyone selected"
                        className="h-9"
                      />
                      <p className="text-[10px] text-slate-500">
                        {filteredByBalance.length} of {selectedStudents.length} selected
                        famil{selectedStudents.length === 1 ? "y" : "ies"} pass this
                        filter.
                      </p>
                    </div>
                  </SectionCard>

                  <SectionCard
                    icon={Send}
                    title="Channel"
                    description="Bold formatting is kept in email; SMS and WhatsApp send plain text."
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {CHANNELS.map((item) => {
                        const Icon = item.icon;
                        const active = form.reminderType === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                reminderType: item.id,
                              }))
                            }
                            className={cn(
                              "flex cursor-pointer flex-col items-start gap-1 rounded-xl border px-2.5 py-2 text-left transition-all active:scale-[0.98]",
                              active
                                ? "border-[#246a59] bg-[#e8f2ef] text-[#1a4d42] ring-1 ring-[#246a59]/20"
                                : "border-slate-200 bg-white text-slate-600 hover:border-[#246a59]/30",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-[11px] font-semibold">{item.label}</span>
                            <span className="text-[9px] opacity-70">{item.hint}</span>
                          </button>
                        );
                      })}
                    </div>
                  </SectionCard>

                  <SectionCard
                    icon={Wallet}
                    title="Recipients"
                    description="A quick sanity check before you write."
                    action={
                      <span className="text-[9px] tabular-nums text-slate-400">
                        {filteredByBalance.length} families
                      </span>
                    }
                  >
                    <RecipientList students={filteredByBalance} max={5} />
                    <label className="mt-2 flex items-start gap-2 border-t border-slate-100 pt-2.5">
                      <Checkbox
                        checked={form.includeInvoiceDetails}
                        onCheckedChange={(checked) =>
                          setForm((prev) => ({
                            ...prev,
                            includeInvoiceDetails: checked === true,
                          }))
                        }
                        className="mt-0.5"
                      />
                      <span className="text-[10px] leading-relaxed text-slate-600">
                        Include bill details in the reminder
                      </span>
                    </label>
                  </SectionCard>
                </div>
              ) : null}

              {step === "compose" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-xl border border-[#1a4d42]/12 bg-white px-3 py-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8f2ef] text-[#1a4d42]">
                      <Users className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-slate-900">
                        {filteredByBalance.length} famil
                        {filteredByBalance.length === 1 ? "y" : "ies"} ·{" "}
                        {channel.label}
                      </p>
                      <p className="text-[9px] text-slate-500">
                        KES {totalBalance.toLocaleString()} outstanding
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[10px] text-[#246a59]"
                      onClick={() => setStep("audience")}
                    >
                      Change
                    </Button>
                  </div>

                  <SectionCard
                    icon={Sparkles}
                    title="Templates"
                    description="Pick a starting point. You can edit every word."
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      {REMINDER_TEMPLATES.map((template) => {
                        const selected = form.message === template.body;
                        return (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => applyTemplate(template.body)}
                            className={cn(
                              "relative flex cursor-pointer flex-col rounded-xl border p-2.5 text-left transition-all active:scale-[0.99]",
                              selected
                                ? "border-[#246a59] bg-[#f3f9f6] ring-1 ring-[#246a59]/20"
                                : TONE_STYLES[template.tone],
                            )}
                          >
                            {selected ? (
                              <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#246a59] text-white">
                                <Check className="h-2.5 w-2.5" />
                              </span>
                            ) : null}
                            <span className="pr-4 text-[11px] font-semibold text-slate-900">
                              {template.label}
                            </span>
                            <span className="mt-0.5 text-[9px] text-slate-500">
                              {template.hint}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </SectionCard>

                  <SectionCard
                    icon={Tag}
                    title="Message"
                    description="Tags are replaced per family when queued."
                    action={
                      <span className="text-[9px] tabular-nums text-slate-400">
                        {form.reminderType === "sms"
                          ? `${characterCount} chars · ${smsSegments} SMS`
                          : `${characterCount} chars`}
                      </span>
                    }
                  >
                    <div className="mb-2 flex flex-wrap gap-1">
                      {REMINDER_TAGS.map((tag) => (
                        <button
                          key={tag.token}
                          type="button"
                          onClick={() => insertTag(tag.token)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9.5px] font-medium text-slate-600 transition-colors hover:border-[#246a59]/30 hover:bg-[#e8f2ef] hover:text-[#1a4d42] active:scale-[0.97]"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {tag.label}
                        </button>
                      ))}
                    </div>
                    <Textarea
                      ref={messageRef}
                      id="reminder-message"
                      rows={9}
                      value={form.message}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          message: event.target.value,
                        }))
                      }
                      placeholder="Write your reminder or pick a template above."
                      className="min-h-[13rem] resize-y text-[12px] leading-relaxed"
                    />
                    <p className="mt-1.5 text-[9px] leading-relaxed text-slate-400">
                      Tip: wrap a phrase in <code>**double asterisks**</code> for
                      bold in email. SMS and WhatsApp strip the asterisks.
                    </p>
                  </SectionCard>

                  <SectionCard
                    icon={Link2}
                    title="Payment link"
                    description="Opens the parent portal’s Payments tab."
                    action={
                      <button
                        type="button"
                        onClick={() => void copyPaymentLink()}
                        className="inline-flex cursor-pointer items-center gap-1 text-[10px] font-semibold text-[#246a59] hover:underline"
                      >
                        {copiedLink ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copiedLink ? "Copied" : "Copy"}
                      </button>
                    }
                  >
                    <Input
                      id="reminder-link"
                      value={paymentLink}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          paymentLink: event.target.value,
                        }))
                      }
                      placeholder="https://your-school.squl.co.ke/parent?tab=payments"
                      className="h-9 font-mono text-[11px]"
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[9.5px] text-slate-500">
                      <a
                        href={paymentLink || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[#246a59] hover:underline"
                      >
                        <Link2 className="h-3 w-3" />
                        Test link
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                      <span>
                        Insert it with the <strong>Payment link</strong> tag.
                      </span>
                    </div>
                  </SectionCard>

                  {previewMessage.includes("[amount]") ? (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-medium text-amber-800">
                      No next-term fee was found for this grade. Replace{" "}
                      <code>[amount]</code> before sending.
                    </p>
                  ) : null}

                  <div className="lg:hidden">
                    <ParentPreview
                      message={previewText}
                      channel={channel}
                      paymentLink={paymentLink}
                      sampleName={sampleStudent?.studentName}
                      characterCount={characterCount}
                      smsSegments={smsSegments}
                    />
                  </div>
                </div>
              ) : null}

              {step === "review" ? (
                <div className="space-y-3">
                  <SectionCard
                    icon={CheckCircle2}
                    title="Ready to queue"
                    description="Review the families and the channel."
                  >
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <MiniMetric label="Families" value={String(filteredByBalance.length)} tone="emerald" />
                      <MiniMetric label="Total balance" value={`KES ${totalBalance.toLocaleString()}`} tone="rose" />
                      <MiniMetric label="Channel" value={channel.label} tone="sky" />
                      <MiniMetric label="Payment link" value={paymentLink.trim() ? "Included" : "Missing"} tone={paymentLink.trim() ? "emerald" : "rose"} />
                    </div>
                    <ul className="mt-3 space-y-1.5 text-[10px] text-slate-600">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Message is written and tags are ready.
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2
                          className={cn(
                            "h-3 w-3",
                            paymentLink.trim()
                              ? "text-emerald-600"
                              : "text-amber-600",
                          )}
                        />
                        {paymentLink.trim()
                          ? "Payment link is included."
                          : "Payment link is missing — add one in Message."}
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        {filteredByBalance.length} famil
                        {filteredByBalance.length === 1 ? "y" : "ies"} will be
                        queued.
                      </li>
                    </ul>
                  </SectionCard>

                  <SectionCard
                    icon={Users}
                    title="Recipients"
                    description="Every family below gets a personalised copy."
                  >
                    <RecipientList students={filteredByBalance} max={10} />
                  </SectionCard>

                  <div className="lg:hidden">
                    <ParentPreview
                      message={previewText}
                      channel={channel}
                      paymentLink={paymentLink}
                      sampleName={sampleStudent?.studentName}
                      characterCount={characterCount}
                      smsSegments={smsSegments}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="hidden min-h-0 overflow-y-auto border-l border-[#1a4d42]/10 bg-white p-4 lg:block">
              <div className="sticky top-0 space-y-3">
                <ParentPreview
                  message={previewText}
                  channel={channel}
                  paymentLink={paymentLink}
                  sampleName={sampleStudent?.studentName}
                  characterCount={characterCount}
                  smsSegments={smsSegments}
                />
                <div className="rounded-xl border border-[#1a4d42]/10 bg-[#f8fbfa] p-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#1a4d42]/45">
                    Why this works
                  </p>
                  <p className="mt-1 text-[10px] leading-relaxed text-[#1a4d42]/65">
                    Each parent sees their child’s name and balance. The payment
                    link opens the parent portal, so the message stays short and
                    safe.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <DrawerFooter className="shrink-0 flex-row gap-2 border-t border-[#1a4d42]/10 bg-white px-4 py-3">
          <div className="flex w-full items-center gap-2">
            {step === "audience" ? (
              <>
                <DrawerClose asChild>
                  <Button variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  className="flex-1 bg-[#0a1f1a] text-white hover:bg-[#143b31]"
                  disabled={filteredByBalance.length === 0}
                  onClick={() => setStep("compose")}
                >
                  Continue to message
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </>
            ) : null}

            {step === "compose" ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("audience")}
                >
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                  Audience
                </Button>
                <Button
                  className="flex-1 bg-[#0a1f1a] text-white hover:bg-[#143b31]"
                  disabled={!canReview}
                  onClick={() => setStep("review")}
                >
                  Review
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </>
            ) : null}

            {step === "review" ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("compose")}
                >
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                  Message
                </Button>
                <Button
                  className="flex-1 bg-[#0a1f1a] text-white hover:bg-[#143b31]"
                  disabled={filteredByBalance.length === 0}
                  onClick={handleConfirmSend}
                >
                  <Send className="mr-1 h-3.5 w-3.5" />
                  Confirm & queue {filteredByBalance.length}
                </Button>
              </>
            ) : null}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ParentPreview({
  message,
  channel,
  paymentLink,
  sampleName,
  characterCount,
  smsSegments,
}: {
  message: string;
  channel: { label: string; id: ReminderChannel };
  paymentLink: string;
  sampleName?: string;
  characterCount: number;
  smsSegments: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Parent view
        </p>
        <span className="rounded-full border border-[#1a4d42]/12 bg-[#f8fbfa] px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-[#1a4d42]/60">
          {channel.label}
        </span>
      </div>
      <div className="rounded-[1.4rem] border border-[#1a4d42]/10 bg-[#eef4f1] p-2 shadow-inner">
        <div className="rounded-[1.1rem] bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-[9px] font-bold text-[#0a1f1a]">
              School fees
            </span>
            <span className="text-[8px] text-slate-400">Reminder</span>
          </div>
          {message.trim() ? (
            <MessageBody
              text={message}
              formatBold={channel.id === "email"}
              className="text-[10.5px] leading-relaxed text-slate-700"
            />
          ) : (
            <p className="py-6 text-center text-[10px] text-slate-400">
              Your message preview will appear here.
            </p>
          )}
          {paymentLink.trim() ? (
            <a
              href={paymentLink.trim()}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-[#0a1f1a] px-2 py-1.5 text-[9.5px] font-semibold text-white transition-colors hover:bg-[#143b31]"
            >
              View fees & pay
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-between text-[8.5px] text-slate-400">
        <span>{sampleName ? `Sample · ${sampleName}` : "Sample parent"}</span>
        <span>
          {channel.id === "sms"
            ? `${characterCount} chars · ${smsSegments} SMS`
            : "Email preview"}
        </span>
      </div>
    </div>
  );
}
