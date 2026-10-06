"use client";

import { useRef, useState } from "react";
import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MergeTag {
  /** The literal token inserted into the message body. */
  token: string;
  /** Friendly name shown on the chip. */
  label: string;
}

export interface MergeTagGroup {
  label: string;
  tags: MergeTag[];
}

const SCHOOL_GROUP: MergeTagGroup = {
  label: "School",
  tags: [{ token: "{{school.name}}", label: "School name" }],
};

const PARENT_GROUP: MergeTagGroup = {
  label: "Parent",
  tags: [{ token: "{{recipient.name}}", label: "Parent name" }],
};

const STUDENT_GROUP: MergeTagGroup = {
  label: "Student",
  tags: [
    { token: "{{student.name}}", label: "Student name" },
    { token: "{{student.class}}", label: "Class" },
    { token: "{{student.grade}}", label: "Grade" },
    { token: "{{student.stream}}", label: "Stream" },
    { token: "{{student.admissionNumber}}", label: "Admission no." },
  ],
};

const TERM_GROUP: MergeTagGroup = {
  label: "Term",
  tags: [
    { token: "{{term.name}}", label: "Term name" },
    { token: "{{term.startDate}}", label: "Term starts" },
    { token: "{{term.endDate}}", label: "Term ends" },
  ],
};

const EVENT_GROUP: MergeTagGroup = {
  label: "Event",
  tags: [
    { token: "{{event.title}}", label: "Event title" },
    { token: "{{event.date}}", label: "Event date" },
    { token: "{{event.endDate}}", label: "Event ends" },
    { token: "{{event.location}}", label: "Venue" },
    { token: "{{event.type}}", label: "Event type" },
    { token: "{{event.description}}", label: "Details" },
  ],
};

const FEES_GROUP: MergeTagGroup = {
  label: "Fees",
  tags: [
    { token: "{{balance}}", label: "Fee balance" },
    { token: "{{invoice.number}}", label: "Invoice no." },
    { token: "{{invoice.dueDate}}", label: "Due date" },
    { token: "{{invoice.amount}}", label: "Invoice total" },
    { token: "{{invoice.paid}}", label: "Amount paid" },
  ],
};

/** Every tag that a scheduled reminder can resolve. */
export const MERGE_TAG_GROUPS: MergeTagGroup[] = [
  SCHOOL_GROUP,
  PARENT_GROUP,
  STUDENT_GROUP,
  TERM_GROUP,
  EVENT_GROUP,
  FEES_GROUP,
];

/**
 * Campaigns are sent outside the reminder engine, so only school/recipient/
 * student (and the student's class details) are populated — term, event and fee
 * tags would render empty.
 */
export const CAMPAIGN_MERGE_TAG_GROUPS: MergeTagGroup[] = [
  SCHOOL_GROUP,
  PARENT_GROUP,
  STUDENT_GROUP,
];

type FieldElement = HTMLInputElement | HTMLTextAreaElement;

interface FieldConfig {
  value: string;
  setValue: (next: string) => void;
  label: string;
}

/**
 * Inserts a merge tag at the caret of whichever field the user last focused,
 * keeping the caret right after the inserted token. Falls back to appending to
 * the default field when nothing has been focused yet.
 */
export function useMergeTagInserter(
  fields: Record<string, FieldConfig>,
  defaultKey?: string,
) {
  const keys = Object.keys(fields);
  const fallback = defaultKey ?? keys[0];
  const [activeKey, setActiveKey] = useState<string>(fallback);
  const elements = useRef<Record<string, FieldElement | null>>({});

  const bind = (key: string) => ({
    ref: (el: FieldElement | null) => {
      elements.current[key] = el;
    },
    onFocus: () => setActiveKey(key),
  });

  const insert = (token: string) => {
    const key = fields[activeKey] ? activeKey : fallback;
    const field = fields[key];
    if (!field) return;

    const el = elements.current[key];
    const current = field.value ?? "";
    const focused =
      el != null && typeof document !== "undefined" && document.activeElement === el;
    const start =
      focused && typeof el.selectionStart === "number"
        ? el.selectionStart
        : current.length;
    const end =
      focused && typeof el.selectionEnd === "number" ? el.selectionEnd : current.length;

    const before = current.slice(0, start);
    const after = current.slice(end);
    const lead = before.length > 0 && !/\s$/.test(before) ? " " : "";
    const trail = after.length > 0 && !/^\s/.test(after) ? " " : "";
    const insertion = `${lead}${token}${trail}`;

    field.setValue(before + insertion + after);

    const caret = before.length + insertion.length;
    requestAnimationFrame(() => {
      const node = elements.current[key];
      if (!node) return;
      node.focus();
      try {
        node.setSelectionRange(caret, caret);
      } catch {
        // Some input types (e.g. email) don't support selection ranges.
      }
    });
  };

  return {
    bind,
    insert,
    activeLabel: fields[activeKey]?.label ?? fields[fallback]?.label ?? "",
  };
}

export function MergeTagPicker({
  groups,
  onInsert,
  activeLabel,
  className,
  columns = "wide",
}: {
  groups: MergeTagGroup[];
  onInsert: (token: string) => void;
  /** Field the next click will append to, shown as a hint. */
  activeLabel?: string;
  className?: string;
  /**
   * `wide` fills the dialog with 2–4 chips per row; `sidebar` assumes the panel
   * is stacked full-width until `lg` and then moves to a narrow side column,
   * where it drops back to 2 per row so tokens stay readable.
   */
  columns?: "wide" | "sidebar";
}) {
  const gridClass =
    columns === "sidebar"
      ? "grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2"
      : "grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4";
  return (
    <div className={cn("rounded-xl border bg-muted/20 p-3", className)}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-medium">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          Tags
          <span className="font-normal text-muted-foreground">
            — click to insert
          </span>
        </p>
        {activeLabel ? (
          <p className="text-[11px] text-muted-foreground">
            Adding to <span className="font-medium">{activeLabel}</span>
          </p>
        ) : null}
      </div>
      <div className="space-y-3">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
              {group.label}
            </p>
            <div className={gridClass}>
              {group.tags.map((tag) => (
                <button
                  key={tag.token}
                  type="button"
                  title={`Insert ${tag.token}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onInsert(tag.token)}
                  className="flex min-w-0 flex-col items-start gap-0.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-left transition-colors hover:border-primary hover:bg-primary/10"
                >
                  <span className="w-full truncate text-[11px] font-medium text-foreground/90">
                    {tag.label}
                  </span>
                  <span className="w-full truncate font-mono text-[10px] text-muted-foreground">
                    {tag.token}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
