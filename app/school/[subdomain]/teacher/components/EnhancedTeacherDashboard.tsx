"use client"

import React, { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  FileText,
  MessageSquare,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import CreateTestSection from "./CreateTestSection";
import MarkRegisterSection from "./MarkRegisterSection";
import { SchoolBroadcastSection } from "@/components/chat/SchoolBroadcastSection";
import IndividualSearchSection from "./IndividualSearchSection";
import ShareResourcesSection from "./ShareResourcesSection";
import AssignHomeworkSection from "./AssignHomeworkSection";
import EnterMarksSection from "./EnterMarksSection";
import { PageHeader, SectionHeading } from "./ui/PageHeader";
import { Panel } from "./ui/Panel";
import { EmptyState, ListSkeleton } from "./ui/States";
import { useTeacherData } from "@/lib/hooks/useTeacherData";
import { useTeacherAssignments } from "@/lib/teacher/useTeacherAssignments";
import { cn } from "@/lib/utils";
import { tp } from "../styles/portal";
import type { TeacherAssignment } from "@/lib/teacher/teacherAssignments";

type SectionId =
  | "create-test"
  | "mark-register"
  | "send-message"
  | "search-individuals"
  | "share-resources"
  | "assign-homework"
  | "enter-marks";

interface Action {
  id: SectionId;
  title: string;
  hint: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export default function EnhancedTeacherDashboard({ subdomain }: { subdomain: string }) {
  const router = useRouter();
  const { teacher, loading: teacherLoading, getClassTeacherClasses } = useTeacherData();
  const { assignments, loading: assignmentsLoading } = useTeacherAssignments();

  const [section, setSection] = useState<SectionId | null>(null);
  const [newlyCreatedTest, setNewlyCreatedTest] = useState<
    | {
        title: string;
        subject: string;
        grade: string;
        date: string;
        startTime: string;
        duration: string;
      }
    | undefined
  >(undefined);

  const [teacherName, setTeacherName] = useState("");
  const [today, setToday] = useState("");
  const [greeting, setGreeting] = useState("Welcome back");

  // Read the display name from the cookie our auth flow already sets. Kept in an
  // effect so the server and first client render agree.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const readCookie = (name: string) => {
      const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
      return match ? decodeURIComponent(match[1]) : "";
    };
    setTeacherName(readCookie("userName"));

    const now = new Date();
    const hour = now.getHours();
    setGreeting(
      hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening",
    );
    setToday(
      new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(now),
    );
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const displayName = (teacher?.fullName || teacherName || "").split(" ")[0];
  const classes = getClassTeacherClasses();

  const dueSoon = useMemo(() => {
    if (!assignments.length) return 0;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return assignments.filter((assignment) => {
      const due = new Date(assignment.date);
      return assignment.status !== "completed" && due >= start && due <= end;
    }).length;
  }, [assignments]);

  const recentAssignments = useMemo(
    () =>
      [...assignments]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
    [assignments],
  );

  const actions: Action[] = [
    {
      id: "create-test",
      title: "New test",
      hint: "Build or reuse questions",
      icon: <Plus className="size-[18px]" strokeWidth={1.8} />,
      onClick: () => setSection("create-test"),
    },
    {
      id: "assign-homework",
      title: "Assign homework",
      hint: "Send work to a class",
      icon: <BookOpen className="size-[18px]" strokeWidth={1.8} />,
      onClick: () => setSection("assign-homework"),
    },
    {
      id: "enter-marks",
      title: "Enter marks",
      hint: "Record exam scores",
      icon: <CheckSquare className="size-[18px]" strokeWidth={1.8} />,
      onClick: () => setSection("enter-marks"),
    },
    {
      id: "mark-register",
      title: "Mark register",
      hint: "Take today's attendance",
      icon: <ClipboardList className="size-[18px]" strokeWidth={1.8} />,
      onClick: () => setSection("mark-register"),
    },
    {
      id: "send-message",
      title: "Send a message",
      hint: "Reach parents or staff",
      icon: <MessageSquare className="size-[18px]" strokeWidth={1.8} />,
      onClick: () => setSection("send-message"),
    },
    {
      id: "share-resources",
      title: "Share resources",
      hint: "Notes and reading",
      icon: <Share2 className="size-[18px]" strokeWidth={1.8} />,
      onClick: () => setSection("share-resources"),
    },
  ];

  const goTo = (href: string) => router.push(href);

  const content = (() => {
    if (section === "create-test") {
      return (
        <CreateTestSection
          subdomain={subdomain}
          onBack={() => setSection(null)}
          onAssignHomework={(testData) => {
            setNewlyCreatedTest(testData);
            setSection("assign-homework");
          }}
        />
      );
    }
    if (section === "mark-register") {
      return <MarkRegisterSection subdomain={subdomain} onBack={() => setSection(null)} />;
    }
    if (section === "send-message") {
      return <SchoolBroadcastSection subdomain={subdomain} onBack={() => setSection(null)} />;
    }
    if (section === "search-individuals") {
      return <IndividualSearchSection subdomain={subdomain} onBack={() => setSection(null)} />;
    }
    if (section === "share-resources") {
      return <ShareResourcesSection subdomain={subdomain} onBack={() => setSection(null)} />;
    }
    if (section === "assign-homework") {
      return (
        <AssignHomeworkSection
          subdomain={subdomain}
          onBack={() => {
            setSection(null);
            setNewlyCreatedTest(undefined);
          }}
          onCreateTest={() => setSection("create-test")}
          newlyCreatedTest={newlyCreatedTest}
        />
      );
    }
    if (section === "enter-marks") {
      return <EnterMarksSection subdomain={subdomain} onBack={() => setSection(null)} />;
    }

    return (
      <div className={tp.stack}>
        <PageHeader
          eyebrow={today || "Teacher"}
          title={
            displayName ? `${greeting}, ${displayName}.` : `${greeting}.`
          }
          description="Here's your day at a glance. Pick up where you left off, or start something new."
          actions={
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="tp-focus tp-press inline-flex h-10 items-center gap-2 rounded-full border border-border/80 bg-card px-4 text-[13px] font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              <RefreshCw className="size-3.5" strokeWidth={2} />
              Refresh
            </button>
          }
        />

        <div className="tp-reveal" style={{ ["--tp-delay" as string]: 1 } as CSSProperties}>
          <Panel padded={false} className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-4">
            <Stat
              label="My classes"
              value={teacherLoading ? null : classes.length}
              hint={
                classes.length > 0
                  ? classes[0].streamName
                    ? `${classes[0].name} · ${classes[0].streamName}`
                    : classes[0].name
                  : "Not a class teacher yet"
              }
            />
            <Stat
              label="Subjects"
              value={teacherLoading ? null : (teacher?.tenantSubjects?.length ?? 0)}
              hint="Assigned to you"
            />
            <Stat
              label="Assignments"
              value={assignmentsLoading ? null : assignments.length}
              hint={`${assignments.filter((a) => a.status === "draft").length} in draft`}
            />
            <Stat
              label="Due this week"
              value={assignmentsLoading ? null : dueSoon}
              hint={dueSoon > 0 ? "Needs attention" : "Nothing pending"}
              accent={dueSoon > 0}
            />
          </Panel>
        </div>

        <section className="space-y-4">
          <SectionHeading hint="Pick one">Start here</SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {actions.map((action, index) => (
              <button
                key={action.id}
                type="button"
                onClick={action.onClick}
                className={cn(
                  "tp-reveal tp-lift group flex items-center gap-4 rounded-2xl border border-border/90 bg-card p-4 text-left shadow-[0_1px_2px_rgba(20,32,28,0.03)]",
                  "hover:border-primary/30 hover:shadow-[0_18px_36px_-28px_rgba(20,32,28,0.45)]",
                )}
                style={{ ["--tp-delay" as string]: index + 1 } as CSSProperties}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/45 text-primary transition-colors group-hover:border-primary/20 group-hover:bg-primary/[0.07]">
                  {action.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-foreground">
                    {action.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
                    {action.hint}
                  </span>
                </span>
                <ArrowUpRight
                  className="size-4 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  strokeWidth={1.8}
                />
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
            {[
              { label: "Timetable", href: "/teacher/timetable" },
              { label: "Lesson plans", href: "/teacher/lesson-plans" },
              { label: "Exams", href: "/teacher/exams" },
              { label: "Find a learner", href: undefined, onClick: () => setSection("search-individuals") },
            ].map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => (link.onClick ? link.onClick() : goTo(link.href!))}
                className="tp-focus group inline-flex items-center gap-1.5 rounded-full text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
                <ArrowRight className="size-3.5 opacity-50 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <section className="space-y-4">
            <SectionHeading hint={`${assignments.length} total`}>
              Recent assignments
            </SectionHeading>
            <Panel padded={false} className="divide-y divide-border/70">
              {assignmentsLoading ? (
                <div className="p-5">
                  <ListSkeleton rows={3} />
                </div>
              ) : recentAssignments.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No assignments yet"
                  description="Create your first test or homework and it will show up here."
                  action={
                    <button
                      type="button"
                      onClick={() => setSection("create-test")}
                      className="tp-focus inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-[12.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
                    >
                      <Plus className="size-3.5" />
                      Create assignment
                    </button>
                  }
                  compact
                />
              ) : (
                <>
                  {recentAssignments.map((assignment) => (
                    <AssignmentRow
                      key={assignment.id}
                      assignment={assignment}
                      onOpen={() => goTo(`/teacher/assignments/${assignment.id}`)}
                    />
                  ))}
                  <div className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => goTo("/teacher/assignments")}
                      className="tp-focus inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary"
                    >
                      View all assignments
                      <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                </>
              )}
            </Panel>
          </section>

          <section className="space-y-4">
            <SectionHeading hint="Class teacher">Your class</SectionHeading>
            <Panel className="space-y-4">
              {classes.length === 0 ? (
                <div className="space-y-2">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-muted/45 text-primary">
                    <Users className="size-[18px]" strokeWidth={1.8} />
                  </span>
                  <p className="text-[14px] font-semibold text-foreground">
                    No class assigned
                  </p>
                  <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                    Only a class teacher can take a register. Ask an administrator to
                    assign you a class.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-semibold text-foreground">
                        {classes[0].name}
                        {classes[0].streamName ? ` · ${classes[0].streamName}` : ""}
                      </p>
                      <p className="mt-1 text-[12.5px] text-muted-foreground">
                        Today&apos;s register is usually taken in the morning.
                      </p>
                    </div>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/[0.07] text-primary">
                      <CalendarDays className="size-[18px]" strokeWidth={1.8} />
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSection("mark-register")}
                      className="tp-focus inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-[12.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
                    >
                      <ClipboardList className="size-3.5" />
                      Take register
                    </button>
                    <button
                      type="button"
                      onClick={() => goTo("/teacher/attendance")}
                      className="tp-focus inline-flex h-9 items-center gap-2 rounded-full border border-border/80 px-4 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Register history
                    </button>
                  </div>
                </>
              )}
            </Panel>

            <Panel className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="size-4" strokeWidth={1.8} />
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em]">
                  Shortcuts
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Exams", href: "/teacher/exams", icon: FileText },
                  { label: "Timetable", href: "/teacher/timetable", icon: CalendarDays },
                  { label: "Lesson plans", href: "/teacher/lesson-plans", icon: BookOpen },
                  { label: "Messages", href: "/teacher/messages", icon: MessageSquare },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => goTo(item.href)}
                      className="tp-focus flex items-center gap-2 rounded-xl border border-transparent px-2.5 py-2 text-left text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-border/70 hover:bg-muted/40 hover:text-foreground"
                    >
                      <Icon className="size-4 text-muted-foreground/70" strokeWidth={1.7} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </Panel>
          </section>
        </div>

        <p className="pb-2 text-[11px] text-muted-foreground/60">
          Signed in as {teacher?.email || teacherName || "teacher"}.
        </p>
      </div>
    );
  })();

  return <div className={tp.page}>{content}</div>;
}

function Stat({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: number | null;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-card px-5 py-5 sm:px-6">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-display text-[1.9rem] leading-none tracking-[-0.02em]",
          accent ? "text-primary" : "text-foreground",
        )}
      >
        {value === null ? <span className="tp-skeleton inline-block h-7 w-10 rounded-md" /> : value}
      </p>
      <p className="mt-1.5 truncate text-[11.5px] text-muted-foreground/85">{hint}</p>
    </div>
  );
}

function AssignmentRow({
  assignment,
  onOpen,
}: {
  assignment: TeacherAssignment;
  onOpen: () => void;
}) {
  const classes = assignment.gradeLevels.map((grade) => grade.gradeLevel.name).join(", ");
  const due = new Date(assignment.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
  const statusTone =
    assignment.status === "completed"
      ? "bg-muted text-muted-foreground"
      : assignment.status === "draft"
        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="tp-focus group flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors hover:bg-muted/35"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted/40 text-muted-foreground transition-colors group-hover:border-primary/25 group-hover:text-primary">
        <FileText className="size-4" strokeWidth={1.7} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-semibold text-foreground">
          {assignment.title}
        </span>
        <span className="mt-0.5 block truncate text-[11.5px] text-muted-foreground">
          {assignment.subject.subject.name} · {classes || "No class"}
        </span>
      </span>
      <span className="hidden text-right text-[11.5px] text-muted-foreground sm:block">
        Due {due}
      </span>
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-semibold capitalize",
          statusTone,
        )}
      >
        {assignment.status}
      </span>
    </button>
  );
}
