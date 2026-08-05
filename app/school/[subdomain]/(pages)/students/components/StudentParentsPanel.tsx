"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudentParents } from "@/lib/hooks/useStudentParents";
import { LinkParentDrawer, type LinkParentStudent } from "./LinkParentDrawer";
import { studentsPanel } from "./students-ui";

interface StudentParentsPanelProps {
  student: LinkParentStudent;
  compact?: boolean;
  className?: string;
}

export function StudentParentsPanel({
  student,
  compact = false,
  className,
}: StudentParentsPanelProps) {
  const { parents, loading, error, refetch } = useStudentParents(student.id);
  const linkedParentIds = parents.map((p) => p.id);

  const linkTrigger = (
    <Button
      size="sm"
      variant={compact ? "outline" : "default"}
      className={cn(
        "gap-1.5 text-xs",
        compact ? "h-7 rounded-none" : "h-8 rounded-none bg-[#0a1f1a] text-white hover:bg-[#246a59]",
      )}
    >
      <UserPlus className="h-3.5 w-3.5" />
      Link parent
    </Button>
  );

  if (loading) {
    return (
      <div className={cn(studentsPanel, "flex items-center justify-center gap-2 p-6", className)}>
        <Loader2 className="h-4 w-4 animate-spin text-[#246a59]" />
        <span className="text-sm text-[#1a4d42]/50">Loading guardians…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(studentsPanel, "p-4 text-center", className)}>
        <AlertCircle className="mx-auto mb-2 h-5 w-5 text-red-400" />
        <p className="text-sm text-[#1a4d42]/50">{error}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 h-8 text-xs"
          onClick={() => void refetch()}
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(studentsPanel, "overflow-hidden", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1a4d42]/10 px-4 py-3 dark:border-white/10 sm:px-5">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#0a1f1a] dark:text-white">
            <Users className="h-4 w-4 text-[#246a59]" />
            Parents &amp; guardians
          </h3>
          <p className="mt-0.5 text-xs text-[#1a4d42]/45">
            {parents.length === 0
              ? "No guardian linked yet"
              : `${parents.length} linked · portal access for fees & grades`}
          </p>
        </div>
        <LinkParentDrawer
          student={student}
          linkedParentIds={linkedParentIds}
          onLinked={() => void refetch()}
          trigger={linkTrigger}
        />
      </div>

      <div className="p-4 sm:p-5">
        {parents.length === 0 ? (
          <div className="rounded-none border border-dashed border-[#1a4d42]/15 bg-[#f8fbfa] px-4 py-6 text-center dark:border-white/15 dark:bg-[#071411]">
            <Users className="mx-auto mb-2 h-8 w-8 text-[#1a4d42]/35" />
            <p className="text-sm font-medium text-[#1a4d42]/65 dark:text-[#1a4d42]/35">
              No parent linked
            </p>
            <p className="mx-auto mt-1 max-w-xs text-xs text-[#1a4d42]/45">
              Link a guardian so they can view fees, grades, and school updates in the parent portal.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <LinkParentDrawer
                student={student}
                linkedParentIds={linkedParentIds}
                onLinked={() => void refetch()}
              />
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {parents.map((parent) => (
              <li
                key={parent.id}
                className="rounded-none border border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-3 dark:border-white/10 dark:bg-[#071411]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0a1f1a] dark:text-white">
                      {parent.name}
                    </p>
                    <div className="mt-1.5 space-y-1">
                      <p className="flex items-center gap-1.5 text-xs text-[#1a4d42]/50">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{parent.email}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-[#1a4d42]/50">
                        <Phone className="h-3 w-3 shrink-0" />
                        {parent.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-medium",
                        parent.userId
                          ? "rounded-none border-[#246a59]/25 bg-[#e8f2ef] text-[#1a4d42]"
                          : "border-amber-200 bg-amber-50 text-amber-700",
                      )}
                    >
                      {parent.userId ? "Portal active" : "Invite pending"}
                    </Badge>
                  </div>
                </div>
                <Link
                  href="/parents"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#246a59] hover:underline"
                >
                  View in Parents
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
