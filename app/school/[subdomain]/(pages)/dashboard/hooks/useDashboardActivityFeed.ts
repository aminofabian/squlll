"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import { useDomainRealtime } from "@/lib/realtime/useDomainRealtime";

export type FeedTone = "payment" | "lesson" | "invite" | "assignment" | "attendance" | "exam" | "default";

export interface DashboardFeedItem {
  id: string;
  message: string;
  detail?: string;
  tone: FeedTone;
  at: number;
}

const MAX_ITEMS = 10;

function push(
  setItems: Dispatch<SetStateAction<DashboardFeedItem[]>>,
  item: Omit<DashboardFeedItem, "id" | "at">,
) {
  setItems((prev) => {
    const next: DashboardFeedItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: Date.now(),
    };
    return [next, ...prev].slice(0, MAX_ITEMS);
  });
}

export function useDashboardActivityFeed() {
  const [items, setItems] = useState<DashboardFeedItem[]>([
    {
      id: "welcome",
      message: "Listening for school activity…",
      detail: "Payments, lessons, invites, and more appear here in real time.",
      tone: "default",
      at: Date.now(),
    },
  ]);

  const seedWelcome = useCallback(() => {
    setItems([
      {
        id: "welcome",
        message: "You're connected",
        detail: "Live updates from across your school will stream in here.",
        tone: "default",
        at: Date.now(),
      },
    ]);
  }, []);

  useDomainRealtime({
    onFeePaymentUpdated: (p) => {
      push(setItems, {
        message: "Fee payment recorded",
        detail: p.studentName
          ? `${p.studentName} · KES ${Number(p.amount).toLocaleString("en-KE")} · ${p.receiptNumber}`
          : `KES ${Number(p.amount).toLocaleString("en-KE")} · ${p.receiptNumber}`,
        tone: "payment",
      });
    },
    onLessonCompleted: () => {
      push(setItems, {
        message: "Lesson marked complete",
        detail: "A teacher checked off a scheduled lesson.",
        tone: "lesson",
      });
    },
    onInvitationAccepted: (p) => {
      push(setItems, {
        message: "Invite accepted",
        detail: `${p.name || p.email} joined the school`,
        tone: "invite",
      });
    },
    onParentInvitationAccepted: (p) => {
      push(setItems, {
        message: "Parent joined portal",
        detail: p.parentName || p.email,
        tone: "invite",
      });
    },
    onAssignmentPublished: (p) => {
      push(setItems, {
        message: "Assignment published",
        detail: p.title,
        tone: "assignment",
      });
    },
    onAssignmentSubmitted: (p) => {
      push(setItems, {
        message: "Work submitted",
        detail: p.studentName
          ? `${p.studentName} · ${p.title}`
          : p.title,
        tone: "assignment",
      });
    },
    onAttendanceRegisterSubmitted: () => {
      push(setItems, {
        message: "Attendance submitted",
        detail: "A register was saved for today.",
        tone: "attendance",
      });
    },
    onExamPublished: (p) => {
      push(setItems, {
        message: "Exam published",
        detail: p.title,
        tone: "exam",
      });
    },
    onTimetablePublished: (p) => {
      push(setItems, {
        message: "Timetable published",
        detail: p.termName,
        tone: "default",
      });
    },
  });

  return { items, seedWelcome };
}
