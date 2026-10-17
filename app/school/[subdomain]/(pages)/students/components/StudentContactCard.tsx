"use client";

import { useState } from "react";
import { Loader2, Mail, Pencil, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  studentsEnrollLink,
  studentsGhostButton,
  studentsPanel,
} from "./students-ui";

const GENDERS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
] as const;

const fieldClass =
  "h-8 rounded-none border-[#1a4d42]/15 bg-white text-sm shadow-none focus-visible:border-[#246a59]/50 focus-visible:ring-[#246a59]/20 dark:border-white/15 dark:bg-[#0c1a17]";

interface EditableStudentContact {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  gender: string;
}

interface StudentContactCardProps {
  student: EditableStudentContact;
  onSaved: () => void;
}

async function saveStudentProfile(student: EditableStudentContact, draft: EditableStudentContact) {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation UpdateStudentProfile($input: UpdateStudentProfileInput!) {
          updateStudentProfile(input: $input)
        }
      `,
      variables: {
        input: {
          studentId: student.id,
          name: draft.studentName.trim(),
          email: draft.email.trim(),
          phone: draft.phone.trim(),
          gender: draft.gender,
        },
      },
    }),
  });

  const body = await response.json();
  if (body.errors?.length) {
    throw new Error(body.errors[0].message ?? "Could not save contact details");
  }
  if (!body.data?.updateStudentProfile) {
    throw new Error("Could not save contact details");
  }
}

function ContactReadout({
  student,
  onEdit,
}: {
  student: EditableStudentContact;
  onEdit: () => void;
}) {
  return (
    <>
      <ContactHeader action={<EditButton onClick={onEdit} />} />
      <ul className="space-y-2.5 p-4 text-sm">
        <ContactLine icon={UserRound} value={student.studentName} empty="No name" />
        <ContactLine icon={Mail} value={student.email} empty="No email" href={student.email ? `mailto:${student.email}` : undefined} />
        <ContactLine icon={Phone} value={student.phone} empty="No phone" href={student.phone ? `tel:${student.phone}` : undefined} />
        <li className="pl-5 text-xs capitalize text-[#1a4d42]/50">
          {student.gender?.toLowerCase() || "Gender not set"}
        </li>
      </ul>
    </>
  );
}

function ContactLine({
  icon: Icon,
  value,
  empty,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value?: string;
  empty: string;
  href?: string;
}) {
  return (
    <li className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1a4d42]/40" />
      {value ? (
        href ? (
          <a href={href} className="break-all text-[#246a59] hover:underline">
            {value}
          </a>
        ) : (
          <span className="text-[#0a1f1a] dark:text-white">{value}</span>
        )
      ) : (
        <span className="text-[#1a4d42]/40">{empty}</span>
      )}
    </li>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(studentsGhostButton, "h-7 w-auto gap-1 text-[#246a59]")}
      onClick={onClick}
    >
      <Pencil className="h-3 w-3" />
      Edit
    </Button>
  );
}

function ContactHeader({ action }: { action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-4 py-3 dark:border-white/10 dark:bg-[#071411]">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[#0a1f1a] dark:text-white">
        <Mail className="h-4 w-4 text-[#1a4d42]/40" />
        Contact
      </h3>
      {action}
    </div>
  );
}

export function StudentContactCard({ student, onSaved }: StudentContactCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<EditableStudentContact>(student);

  const startEditing = () => {
    setDraft({
      ...student,
      gender: student.gender?.toLowerCase() === "male" ? "male" : "female",
    });
    setEditing(true);
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await saveStudentProfile(student, draft);
      toast.success("Contact details saved");
      setEditing(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save contact details");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className={cn(studentsPanel, "flex flex-col")}>
        <ContactReadout student={student} onEdit={startEditing} />
      </div>
    );
  }

  return (
    <div className={cn(studentsPanel, "flex flex-col")}>
      <ContactHeader />
      <ContactForm
        draft={draft}
        saving={saving}
        onChange={setDraft}
        onCancel={() => setEditing(false)}
        onSave={() => void save()}
      />
    </div>
  );
}

function ContactForm({
  draft,
  saving,
  onChange,
  onCancel,
  onSave,
}: {
  draft: EditableStudentContact;
  saving: boolean;
  onChange: (next: EditableStudentContact) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const setField = (field: keyof EditableStudentContact, value: string) => {
    onChange({ ...draft, [field]: value });
  };

  return (
    <form
      className="space-y-3 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <Field label="Full name">
        <Input className={fieldClass} value={draft.studentName} onChange={(event) => setField("studentName", event.target.value)} required />
      </Field>
      <Field label="Email">
        <Input className={fieldClass} type="email" value={draft.email} onChange={(event) => setField("email", event.target.value)} required />
      </Field>
      <Field label="Phone">
        <Input className={fieldClass} type="tel" value={draft.phone} onChange={(event) => setField("phone", event.target.value)} required />
      </Field>
      <Field label="Gender">
        <div className="grid grid-cols-2 gap-2">
          {GENDERS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "h-8 border text-xs",
                draft.gender === option.value
                  ? "border-[#0a1f1a] bg-[#0a1f1a] text-white"
                  : "border-[#1a4d42]/15 bg-white text-[#1a4d42]/70 hover:border-[#246a59]/40",
              )}
              onClick={() => setField("gender", option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Field>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" className={cn(studentsEnrollLink, "h-8")} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Save
        </Button>
        <Button type="button" variant="ghost" size="sm" className={cn(studentsGhostButton, "h-8 w-auto")} onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
        {label}
      </span>
      {children}
    </label>
  );
}
