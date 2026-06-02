"use client";

import { useMemo } from "react";
import { getCookie } from "@/lib/utils";

export interface FeesAccess {
  role: string;
  isReadOnly: boolean;
  canManagePlans: boolean;
  canAssignPlans: boolean;
  canBillStudents: boolean;
  canRecordPayments: boolean;
  canSendReminders: boolean;
  canAdjustFees: boolean;
  canViewReports: boolean;
  canExport: boolean;
}

function normalizeRole(raw: string | null): string {
  return (raw || "SCHOOL_ADMIN").trim().toUpperCase();
}

export function resolveFeesAccess(roleRaw: string | null): FeesAccess {
  const role = normalizeRole(roleRaw);

  if (role === "TEACHER") {
    return {
      role,
      isReadOnly: true,
      canManagePlans: false,
      canAssignPlans: false,
      canBillStudents: false,
      canRecordPayments: false,
      canSendReminders: false,
      canAdjustFees: false,
      canViewReports: false,
      canExport: false,
    };
  }

  if (role === "PARENT" || role === "STUDENT") {
    return {
      role,
      isReadOnly: true,
      canManagePlans: false,
      canAssignPlans: false,
      canBillStudents: false,
      canRecordPayments: false,
      canSendReminders: false,
      canAdjustFees: false,
      canViewReports: false,
      canExport: false,
    };
  }

  if (role.includes("PRINCIPAL") || role === "VIEWER" || role === "READ_ONLY") {
    return {
      role,
      isReadOnly: true,
      canManagePlans: false,
      canAssignPlans: false,
      canBillStudents: false,
      canRecordPayments: false,
      canSendReminders: false,
      canAdjustFees: false,
      canViewReports: true,
      canExport: true,
    };
  }

  return {
    role,
    isReadOnly: false,
    canManagePlans: true,
    canAssignPlans: true,
    canBillStudents: true,
    canRecordPayments: true,
    canSendReminders: true,
    canAdjustFees: true,
    canViewReports: true,
    canExport: true,
  };
}

export function useFeesAccess(): FeesAccess {
  return useMemo(() => {
    const role = getCookie("userRole");
    return resolveFeesAccess(role);
  }, []);
}
