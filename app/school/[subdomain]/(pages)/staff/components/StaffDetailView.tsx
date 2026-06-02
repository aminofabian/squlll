"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Staff } from "../hooks/useStaff";
import {
  getRoleBadgeColor,
  getStatusBadgeColor,
} from "../hooks/useStaff";
import {
  formatStaffDate,
  formatStaffLabel,
  staffDisplayName,
} from "../utils/staff-utils";
import { staffPanel } from "./staff-ui";

interface StaffDetailViewProps {
  staffMember: Staff;
  onClose: () => void;
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-800 dark:text-slate-100">
        {value || "—"}
      </dd>
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
    <div className={cn(staffPanel, "p-4")}>
      <h3 className="mb-3 text-sm font-medium text-slate-800 dark:text-slate-100">
        {title}
      </h3>
      <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>
    </div>
  );
}

export function StaffDetailView({ staffMember, onClose }: StaffDetailViewProps) {
  const name = staffDisplayName(staffMember);

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="-ml-2 h-8 gap-1.5 text-xs text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to directory
      </Button>

      <div className={cn(staffPanel, "p-5")}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {name}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {staffMember.role ? (
                  <Badge
                    variant="outline"
                    className={getRoleBadgeColor(staffMember.role)}
                  >
                    {formatStaffLabel(staffMember.role)}
                  </Badge>
                ) : null}
                <Badge
                  variant="outline"
                  className={
                    staffMember.status
                      ? getStatusBadgeColor(staffMember.status)
                      : staffMember.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                  }
                >
                  {formatStaffLabel(staffMember.status) ||
                    (staffMember.isActive ? "Active" : "Inactive")}
                </Badge>
                {!staffMember.hasCompletedProfile ? (
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-amber-700"
                  >
                    Incomplete profile
                  </Badge>
                ) : null}
              </div>
              {staffMember.employeeId ? (
                <p className="mt-2 text-xs text-slate-400">
                  Employee ID · {staffMember.employeeId}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="h-9 w-full justify-start rounded-lg bg-slate-100/80 p-1 dark:bg-slate-800/60">
          <TabsTrigger value="details" className="text-xs">
            Details
          </TabsTrigger>
          <TabsTrigger value="professional" className="text-xs">
            Professional
          </TabsTrigger>
          {staffMember.salary != null ? (
            <TabsTrigger value="compensation" className="text-xs">
              Compensation
            </TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="details" className="mt-0 space-y-4">
          <InfoGroup title="Contact">
            <DetailField
              label="Email"
              value={
                staffMember.email ? (
                  <a
                    href={`mailto:${staffMember.email}`}
                    className="text-primary hover:underline"
                  >
                    {staffMember.email}
                  </a>
                ) : null
              }
            />
            <DetailField label="Phone" value={staffMember.phoneNumber} />
            <DetailField label="Address" value={staffMember.address} />
            <DetailField
              label="Emergency contact"
              value={
                staffMember.emergencyContact
                  ? `${staffMember.emergencyContact}${staffMember.emergencyContactPhone ? ` · ${staffMember.emergencyContactPhone}` : ""}`
                  : null
              }
            />
          </InfoGroup>

          <InfoGroup title="Personal">
            <DetailField label="Gender" value={formatStaffLabel(staffMember.gender)} />
            <DetailField
              label="Date of birth"
              value={formatStaffDate(staffMember.dateOfBirth)}
            />
            <DetailField
              label="Date joined"
              value={formatStaffDate(staffMember.dateOfJoining)}
            />
            <DetailField label="National ID" value={staffMember.nationalId} />
          </InfoGroup>
        </TabsContent>

        <TabsContent value="professional" className="mt-0 space-y-4">
          <InfoGroup title="Role & department">
            <DetailField
              label="Department"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  {formatStaffLabel(staffMember.department)}
                </span>
              }
            />
            <DetailField label="Supervisor" value={staffMember.supervisor} />
            <DetailField
              label="Job description"
              value={staffMember.jobDescription}
            />
          </InfoGroup>

          <InfoGroup title="Qualifications & experience">
            <DetailField
              label="Qualifications"
              value={staffMember.qualifications}
            />
            <DetailField
              label="Work experience"
              value={staffMember.workExperience}
            />
          </InfoGroup>
        </TabsContent>

        {staffMember.salary != null ? (
          <TabsContent value="compensation" className="mt-0">
            <InfoGroup title="Salary & banking">
              <DetailField
                label="Monthly salary"
                value={`KES ${staffMember.salary.toLocaleString()}`}
              />
              <DetailField label="Bank" value={staffMember.bankName} />
              <DetailField
                label="Account"
                value={
                  staffMember.bankAccount
                    ? `•••• ${staffMember.bankAccount.slice(-4)}`
                    : null
                }
              />
            </InfoGroup>
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
