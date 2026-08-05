"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ParentAvatar } from "./ParentAvatar";
import {
  parentsBadge,
  parentsField,
  parentsFieldLabel,
  parentsPanel,
  parentsSectionHead,
  parentsTabList,
  parentsTabTrigger,
} from "./parents-ui";
import type { ParentsListItem } from "../utils/mapGraphqlParent";
import type { ParentInvitation } from "../types";
import {
  formatParentDate,
  formatRelationship,
  relationshipBadgeClass,
} from "../utils/parents-utils";
import { isParentProfileIncomplete } from "../utils/mapGraphqlParent";
import { ParentAccountPanel } from "./ParentAccountPanel";
import { ParentChildrenEditor } from "./ParentChildrenEditor";
import { ParentFeesPanel } from "./ParentFeesPanel";
import {
  AlertTriangle,
  ArrowLeft,
  Copy,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ParentDetailViewProps {
  parent: ParentsListItem;
  pendingInvitation?: ParentInvitation | null;
  detailLoading?: boolean;
  onClose?: () => void;
  onUpdated?: () => void;
}

function DetailField({
  label,
  value,
  copyValue,
}: {
  label: string;
  value: React.ReactNode;
  copyValue?: string;
}) {
  return (
    <div className={parentsField}>
      <p className={parentsFieldLabel}>{label}</p>
      <div className="mt-1 flex items-start justify-between gap-2">
        <div className="min-w-0 text-sm text-[#0a1f1a] dark:text-white">
          {value}
        </div>
        {copyValue ? (
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(copyValue);
              toast.success("Copied to clipboard");
            }}
            className="shrink-0 rounded-none p-1 text-[#1a4d42]/40 hover:text-[#246a59]"
            aria-label={`Copy ${label}`}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function InfoGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#246a59]">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

export function ParentDetailView({
  parent,
  pendingInvitation,
  detailLoading = false,
  onClose,
  onUpdated,
}: ParentDetailViewProps) {
  const profileIncomplete = isParentProfileIncomplete(parent);
  const joinDate = formatParentDate(parent.registrationDate);
  const updatedDate = formatParentDate(parent.updatedAt);

  const metaLine = [
    formatRelationship(parent.relationship),
    parent.studentCount > 0
      ? `${parent.studentCount} child${parent.studentCount !== 1 ? "ren" : ""}`
      : null,
    parent.occupation?.trim() || null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-3">
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-0.5 text-[11px] font-medium text-[#1a4d42]/50 transition-colors hover:text-[#0a1f1a] dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to list
        </button>
      ) : null}

      {detailLoading ? (
        <div className="flex items-center gap-2 text-xs text-[#1a4d42]/50">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Refreshing profile…
        </div>
      ) : null}

      {profileIncomplete ? (
        <div className="flex items-center gap-2 rounded-none border border-[#246a59]/20 bg-[#e8f2ef] px-3 py-2 text-[11px] text-[#1a4d42] dark:border-[#246a59]/30 dark:bg-[#246a59]/15 dark:text-[#d4e8e2]">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#246a59]" />
          <p>
            <span className="font-semibold">Profile incomplete.</span> Add
            email, phone, or address so the school can reach this parent.
          </p>
        </div>
      ) : null}

      <div className={cn(parentsPanel)}>
        <div className="bg-[#f8fbfa] px-4 py-4 dark:bg-[#071411] sm:px-5">
          <div className="flex gap-3.5">
            <ParentAvatar name={parent.name} size="lg" ring />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-normal tracking-tight text-[#0a1f1a] dark:text-white sm:text-2xl">
                  {parent.name}
                </h2>
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-none text-[10px] font-medium",
                    parent.status === "active"
                      ? "border-[#246a59]/25 bg-[#e8f2ef] text-[#1a4d42]"
                      : "border-amber-200 bg-amber-50 text-amber-800",
                  )}
                >
                  {parent.status === "active" ? "Active" : "Not activated"}
                </Badge>
              </div>
              {metaLine ? (
                <p className="mt-1 text-sm capitalize text-[#1a4d42]/55">
                  {metaLine}
                </p>
              ) : null}
              {parent.email ? (
                <p className="mt-1 truncate text-xs text-[#1a4d42]/45">
                  {parent.email}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-medium capitalize",
                    relationshipBadgeClass(parent.relationship),
                  )}
                >
                  {formatRelationship(parent.relationship)}
                </Badge>
                <Badge variant="outline" className={parentsBadge}>
                  {parent.studentCount} linked child
                  {parent.studentCount !== 1 ? "ren" : ""}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className={parentsTabList}>
          <TabsTrigger value="details" className={parentsTabTrigger}>
            Details
          </TabsTrigger>
          <TabsTrigger value="children" className={parentsTabTrigger}>
            Children
          </TabsTrigger>
          <TabsTrigger value="fees" className={parentsTabTrigger}>
            Fees
          </TabsTrigger>
          <TabsTrigger value="account" className={parentsTabTrigger}>
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-0">
          <div className={`${parentsPanel} overflow-hidden`}>
            <div className={cn(parentsSectionHead, "px-4 py-2.5 sm:px-5")}>
              <h3 className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
                Contact &amp; personal
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 sm:p-4">
              <InfoGroup title="Contact">
                <DetailField
                  label="Email"
                  copyValue={parent.email || undefined}
                  value={
                    parent.email ? (
                      <a
                        href={`mailto:${parent.email}`}
                        className="break-all text-[#246a59] hover:underline"
                      >
                        {parent.email}
                      </a>
                    ) : (
                      <span className="text-[#1a4d42]/40">Not provided</span>
                    )
                  }
                />
                <DetailField
                  label="Phone"
                  copyValue={parent.phone || undefined}
                  value={
                    parent.phone ? (
                      <a
                        href={`tel:${parent.phone}`}
                        className="text-[#0a1f1a] hover:underline dark:text-white"
                      >
                        {parent.phone}
                      </a>
                    ) : (
                      <span className="text-[#1a4d42]/40">Not provided</span>
                    )
                  }
                />
                <DetailField
                  label="Address"
                  copyValue={parent.homeAddress || undefined}
                  value={
                    parent.homeAddress?.trim() ? (
                      parent.homeAddress
                    ) : (
                      <span className="text-[#1a4d42]/40">Not provided</span>
                    )
                  }
                />
              </InfoGroup>

              <InfoGroup title="Personal">
                <DetailField
                  label="Occupation"
                  value={
                    parent.occupation?.trim() ? (
                      parent.occupation
                    ) : (
                      <span className="text-[#1a4d42]/40">Not provided</span>
                    )
                  }
                />
                <DetailField
                  label="Relationship"
                  value={formatRelationship(parent.relationship)}
                />
                <DetailField
                  label="Registered"
                  value={joinDate ?? "Not available"}
                />
                {updatedDate ? (
                  <DetailField label="Last updated" value={updatedDate} />
                ) : null}
              </InfoGroup>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="children" className="mt-0">
          <ParentChildrenEditor
            parentId={parent.id}
            students={parent.students}
            onUpdated={onUpdated}
          />
        </TabsContent>

        <TabsContent value="fees" className="mt-0">
          <ParentFeesPanel students={parent.students} />
        </TabsContent>

        <TabsContent value="account" className="mt-0">
          <ParentAccountPanel
            parentId={parent.id}
            email={parent.email}
            name={parent.name}
            isActive={parent.status === "active"}
            userId={parent.userId}
            hasCompletedProfile={!profileIncomplete}
            pendingInvitation={pendingInvitation}
            onUpdated={onUpdated}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
