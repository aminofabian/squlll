"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Plus,
  Edit3,
  Users,
  HardDrive,
  School,
} from "lucide-react";

// ─── Types & Mock Data ─────────────────────────────────────────

interface PlanFeature {
  key: string;
  label: string;
}

const ALL_FEATURES: PlanFeature[] = [
  { key: "TIMETABLE", label: "Timetable" },
  { key: "LIBRARY", label: "Library" },
  { key: "EXAM_MODULE", label: "Exam Module" },
  { key: "SMS_ALERTS", label: "SMS Alerts" },
  { key: "FINANCE", label: "Finance" },
  { key: "HOSTEL_MANAGEMENT", label: "Hostel Management" },
  { key: "TRANSPORT", label: "Transport" },
  { key: "ANALYTICS", label: "Analytics" },
];

interface Plan {
  id: number;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number | null;
  trialDays: number;
  graceDays: number;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  isDefault: boolean;
  isActive: boolean;
}

const mockPlans: Plan[] = [
  {
    id: 1,
    name: "Starter",
    description: "Perfect for small schools getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    trialDays: 150,
    graceDays: 20,
    features: {
      TIMETABLE: true,
      LIBRARY: false,
      EXAM_MODULE: true,
      SMS_ALERTS: false,
      FINANCE: false,
      HOSTEL_MANAGEMENT: false,
      TRANSPORT: false,
      ANALYTICS: false,
    },
    limits: { maxStudents: 100, maxTeachers: 10, maxStorage: 1 },
    isDefault: true,
    isActive: true,
  },
  {
    id: 2,
    name: "Standard",
    description: "For growing schools with advanced needs",
    monthlyPrice: 99.99,
    yearlyPrice: 999.99,
    trialDays: 30,
    graceDays: 15,
    features: {
      TIMETABLE: true,
      LIBRARY: true,
      EXAM_MODULE: true,
      SMS_ALERTS: true,
      FINANCE: true,
      HOSTEL_MANAGEMENT: false,
      TRANSPORT: false,
      ANALYTICS: true,
    },
    limits: { maxStudents: 500, maxTeachers: 50, maxStorage: 10 },
    isDefault: false,
    isActive: true,
  },
  {
    id: 3,
    name: "Premium",
    description: "Complete solution for large institutions",
    monthlyPrice: 299.99,
    yearlyPrice: 2999.99,
    trialDays: 30,
    graceDays: 30,
    features: {
      TIMETABLE: true,
      LIBRARY: true,
      EXAM_MODULE: true,
      SMS_ALERTS: true,
      FINANCE: true,
      HOSTEL_MANAGEMENT: true,
      TRANSPORT: true,
      ANALYTICS: true,
    },
    limits: { maxStudents: -1, maxTeachers: -1, maxStorage: 100 },
    isDefault: false,
    isActive: true,
  },
];

function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return `$${price.toFixed(2)}`;
}

function formatLimit(value: number, label: string): string {
  if (value === -1) return `Unlimited ${label}`;
  return `${value} ${label}`;
}

export default function PlansPage() {
  const [plans] = useState<Plan[]>(mockPlans);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Plans
                </h1>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage subscription plans and pricing
              </p>
            </div>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Plan
            </Button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border rounded-2xl bg-white dark:bg-slate-900/80 p-6 shadow-sm transition-all duration-200 hover:shadow-md ${
                plan.isDefault
                  ? "border-primary ring-2 ring-primary/20 hover:border-primary"
                  : "border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300/80 dark:hover:border-slate-700/80"
              }`}
            >
              {/* Default badge */}
              {plan.isDefault && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-[10px] uppercase px-3">
                    Default
                  </Badge>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6 mt-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {plan.name}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {plan.description}
                </p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                    {formatPrice(plan.monthlyPrice)}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-sm text-slate-500 ml-1">/mo</span>
                  )}
                </div>
                {plan.yearlyPrice && plan.yearlyPrice > 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    {formatPrice(plan.yearlyPrice)}/year
                  </p>
                )}
              </div>

              {/* Trial & Grace */}
              <div className="flex justify-center gap-4 mb-6 text-xs text-slate-500">
                <span>{plan.trialDays} day trial</span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span>{plan.graceDays} day grace</span>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Features
                </p>
                {ALL_FEATURES.map((feature) => (
                  <div
                    key={feature.key}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {feature.label}
                    </span>
                    {plan.features[feature.key] ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                ))}
              </div>

              {/* Limits */}
              <div className="space-y-3 mb-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Limits
                </p>
                {Object.entries(plan.limits).map(([key, value]) => {
                  const labelMap: Record<string, string> = {
                    maxStudents: "Students",
                    maxTeachers: "Teachers",
                    maxStorage: "GB Storage",
                  };
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                    >
                      {key === "maxStudents" && (
                        <Users className="h-4 w-4 text-slate-400" />
                      )}
                      {key === "maxTeachers" && (
                        <School className="h-4 w-4 text-slate-400" />
                      )}
                      {key === "maxStorage" && (
                        <HardDrive className="h-4 w-4 text-slate-400" />
                      )}
                      <span>{formatLimit(value, labelMap[key] || key)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <Button variant="outline" className="w-full" size="sm">
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Plan
              </Button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
