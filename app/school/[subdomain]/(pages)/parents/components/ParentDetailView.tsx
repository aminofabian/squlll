"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ParentAvatar } from "./ParentAvatar";
import { parentsPanel } from "./parents-ui";
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
  Calendar,
  Copy,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
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
  icon: Icon,
  copyValue,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  copyValue?: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50/80 px-3 py-2.5 dark:bg-slate-800/30">
      <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {Icon ? <Icon className="h-3 w-3 shrink-0" /> : null}
        {label}
      </p>
      <div className="mt-1 flex items-start justify-between gap-2">
        <div className="min-w-0 text-sm text-slate-800 dark:text-slate-100">
          {value}
        </div>
        {copyValue ? (
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(copyValue);
              toast.success("Copied to clipboard");
            }}
            className="shrink-0 rounded p-1 text-slate-400 hover:text-slate-600"
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
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
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

  return (
    <div className="space-y-5">
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to list
        </button>
      ) : null}

      {detailLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Refreshing profile…
        </div>
      ) : null}

      {profileIncomplete ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Profile incomplete</p>
            <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
              Email, phone, or address is missing. Update contact details so
              the school can reach this parent.
            </p>
          </div>
        </div>
      ) : null}

      <div className={`${parentsPanel} overflow-hidden`}>
        <div className="bg-gradient-to-br from-slate-50/80 to-white px-4 py-5 dark:from-slate-900/40 dark:to-slate-900/20 sm:px-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <ParentAvatar name={parent.name} size="lg" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {parent.name}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">{parent.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-medium capitalize",
                    relationshipBadgeClass(parent.relationship),
                  )}
                >
                  {formatRelationship(parent.relationship)}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-medium",
                    parent.status === "active"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700",
                  )}
                >
                  {parent.status === "active" ? "Active" : "Not activated"}
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-medium">
                  {parent.studentCount} linked child
                  {parent.studentCount !== 1 ? "ren" : ""}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-4 inline-flex h-10 w-full flex-wrap rounded-lg border border-slate-200/80 bg-slate-50/80 p-1 dark:border-slate-800 dark:bg-slate-900/60 sm:w-auto">
          <TabsTrigger
            value="details"
            className="flex-1 rounded-md px-3 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm sm:flex-none sm:px-4 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            value="children"
            className="flex-1 rounded-md px-3 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm sm:flex-none sm:px-4 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100"
          >
            Children
          </TabsTrigger>
          <TabsTrigger
            value="fees"
            className="flex-1 rounded-md px-3 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm sm:flex-none sm:px-4 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100"
          >
            Fees
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="flex-1 rounded-md px-3 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm sm:flex-none sm:px-4 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100"
          >
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-0">
          <div className={`${parentsPanel} overflow-hidden`}>
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Contact &amp; personal information
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-5">
              <InfoGroup title="Contact" icon={Mail}>
                <DetailField
                  label="Email"
                  icon={Mail}
                  copyValue={parent.email || undefined}
                  value={
                    parent.email ? (
                      <a
                        href={`mailto:${parent.email}`}
                        className="break-all text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        {parent.email}
                      </a>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )
                  }
                />
                <DetailField
                  label="Phone"
                  icon={Phone}
                  copyValue={parent.phone || undefined}
                  value={
                    parent.phone ? (
                      <a
                        href={`tel:${parent.phone}`}
                        className="hover:underline"
                      >
                        {parent.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )
                  }
                />
                <DetailField
                  label="Address"
                  icon={MapPin}
                  copyValue={parent.homeAddress || undefined}
                  value={
                    parent.homeAddress?.trim() ? (
                      parent.homeAddress
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )
                  }
                />
              </InfoGroup>

              <InfoGroup title="Personal" icon={User}>
                <DetailField
                  label="Occupation"
                  value={
                    parent.occupation?.trim() ? (
                      parent.occupation
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )
                  }
                />
                <DetailField
                  label="Relationship"
                  value={formatRelationship(parent.relationship)}
                />
                <DetailField
                  label="Registered"
                  icon={Calendar}
                  value={joinDate ?? "Not available"}
                />
                {updatedDate ? (
                  <DetailField
                    label="Last updated"
                    icon={Calendar}
                    value={updatedDate}
                  />
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
