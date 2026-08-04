"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSchoolConfig } from "@/lib/hooks/useSchoolConfig";
import { StaffAddTrigger, type StaffAddTriggerVariant } from "./StaffAddTrigger";

interface CreateStaffDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  triggerVariant?: StaffAddTriggerVariant;
  onStaffCreated: () => void;
}

type StaffType =
  | "teaching"
  | "administrative"
  | "support"
  | "part-time"
  | "substitute";

interface StaffFormData {
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  position: string;
  department: string;
  staffType: StaffType;
  joinDate: string;
  workSchedule: string;
  officeLocation: string;
  qualifications: string;
  experience: string;
  subjects: string;
  specializations: string;
  responsibilities: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  gender: string;
}

const emptyForm = (): StaffFormData => ({
  name: "",
  employeeId: "",
  email: "",
  phone: "+254",
  dateOfBirth: "",
  address: "",
  position: "",
  department: "",
  staffType: "administrative",
  joinDate: "",
  workSchedule: "Full-time",
  officeLocation: "",
  qualifications: "",
  experience: "",
  subjects: "",
  specializations: "",
  responsibilities: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "+254",
  gender: "",
});

const DEPARTMENTS = [
  "Administration",
  "Mathematics",
  "Sciences",
  "English",
  "Languages",
  "Social Studies",
  "Physical Education",
  "Arts & Music",
  "Computer Science",
  "Library Services",
  "Laboratory",
  "ICT Support",
  "Security",
  "Maintenance",
] as const;

const POSITIONS: Record<StaffType, string[]> = {
  teaching: [
    "Mathematics Teacher",
    "Science Teacher",
    "English Teacher",
    "Head of Department",
  ],
  administrative: [
    "Principal",
    "Deputy Principal",
    "Registrar",
    "Finance Officer",
  ],
  support: ["Librarian", "Lab Technician", "ICT Technician", "Secretary"],
  "part-time": ["Part-time Teacher", "Consultant", "Tutor"],
  substitute: ["Substitute Teacher", "Relief Teacher", "Temporary Staff"],
};

function formatPhoneNumber(value: string): string {
  if (value === "" || value === "+" || value === "+2" || value === "+25") {
    return "+254";
  }

  let cleaned = value.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "+254" + cleaned.substring(1);
  } else if (cleaned && /^\d/.test(cleaned) && !cleaned.startsWith("+")) {
    cleaned = "+254" + cleaned;
  } else if (cleaned.startsWith("+2540")) {
    cleaned = "+254" + cleaned.substring(5);
  } else if (!cleaned || cleaned === "+") {
    cleaned = "+254";
  }

  if (cleaned.startsWith("+254") && cleaned.length > 13) {
    cleaned = cleaned.substring(0, 13);
  }

  return cleaned;
}

const fieldShell =
  "h-10 rounded-none border border-[#1a4d42]/15 bg-white text-sm shadow-none placeholder:text-[#1a4d42]/40 focus-visible:border-[#246a59]/50 focus-visible:ring-1 focus-visible:ring-[#246a59]/25 dark:border-white/15 dark:bg-[#0c1a17] dark:placeholder:text-white/40";

const selectShell =
  "h-10 rounded-none border border-[#1a4d42]/15 bg-white text-sm shadow-none focus:ring-1 focus:ring-[#246a59]/25 dark:border-white/15 dark:bg-[#0c1a17]";

const labelClass = "text-xs font-medium text-[#0a1f1a] dark:text-white/80";

export function CreateStaffDrawer({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultOpen = false,
  triggerVariant = "header",
  onStaffCreated,
}: CreateStaffDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled =
    controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const { data: schoolConfig } = useSchoolConfig();
  const [formData, setFormData] = useState<StaffFormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultOpen && !isControlled) setInternalOpen(true);
  }, [defaultOpen, isControlled]);

  const handleInputChange = (field: keyof StaffFormData, value: string) => {
    if (field === "phone" || field === "emergencyContactPhone") {
      value = formatPhoneNumber(value);
    }
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "staffType") {
        next.position = "";
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schoolConfig?.tenant?.id) {
      toast.error("Configuration error", {
        description:
          "School configuration not available. Please refresh and try again.",
      });
      return;
    }

    const requiredFields: Partial<Record<keyof StaffFormData, string>> = {
      name: formData.name,
      employeeId: formData.employeeId,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      department: formData.department,
      position: formData.position,
      qualifications: formData.qualifications,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value || value.trim() === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      toast.error("Missing fields", {
        description: `Please fill in: ${missingFields.join(", ")}`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/school/create-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tenantId: schoolConfig.tenant.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details
            .map((error: { message?: string }) => error.message)
            .join(", ");
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        throw new Error(result.error || "Failed to create staff member");
      }

      const staffData = result.inviteStaff;

      toast.success("Staff member created", {
        description: `Invitation sent to ${staffData.email}.`,
      });

      setFormData(emptyForm());
      onStaffCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error("Creation failed", {
        description:
          error instanceof Error
            ? error.message
            : "Could not create staff member",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const positionOptions = POSITIONS[formData.staffType] ?? [];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {!isControlled ? (
        <DrawerTrigger asChild>
          <StaffAddTrigger
            variant={triggerVariant}
            loading={isSubmitting}
            loadingLabel={isSubmitting ? "Adding…" : "Loading…"}
          />
        </DrawerTrigger>
      ) : null}
      <DrawerContent
        className="ml-auto flex h-[100dvh] max-h-[100dvh] w-full flex-col border-l border-[#1a4d42]/12 bg-white dark:border-white/10 dark:bg-[#071411] sm:max-w-[400px]"
        data-vaul-drawer-direction="right"
      >
        <DrawerHeader className="shrink-0 border-b border-[#1a4d42]/12 px-5 py-4 dark:border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DrawerTitle className="font-display text-left text-lg tracking-tight text-[#0a1f1a] dark:text-white">
                Add staff
              </DrawerTitle>
              <DrawerDescription className="mt-0.5 text-left text-sm text-[#1a4d42]/55 dark:text-white/45">
                They&apos;ll get an email to join
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center text-[#1a4d42]/40 hover:bg-[#f3f7f5] hover:text-[#0a1f1a] dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <form
          id="create-staff-form"
          onSubmit={handleSubmit}
          className="relative flex-1 overflow-y-auto px-5 py-5"
        >
          {isSubmitting ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-[#071411]/80">
              <div className="flex items-center gap-2 text-sm text-[#0a1f1a] dark:text-white">
                <Loader2 className="h-4 w-4 animate-spin text-[#246a59]" />
                Sending invitation…
              </div>
            </div>
          ) : null}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="staff-name" className={labelClass}>
                Full name
              </Label>
              <Input
                id="staff-name"
                placeholder="e.g. Jane Wanjiku"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={fieldShell}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-employeeId" className={labelClass}>
                Employee ID
              </Label>
              <Input
                id="staff-employeeId"
                placeholder="STF/2026/001"
                value={formData.employeeId}
                onChange={(e) => handleInputChange("employeeId", e.target.value)}
                className={fieldShell}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-email" className={labelClass}>
                Work email
              </Label>
              <Input
                id="staff-email"
                type="email"
                placeholder="staff@school.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={fieldShell}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-phone" className={labelClass}>
                Phone
              </Label>
              <Input
                id="staff-phone"
                placeholder="+254700000000"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={fieldShell}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className={labelClass}>Gender</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["Male", "Female"] as const).map((option) => {
                  const active = formData.gender === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleInputChange("gender", option)}
                      className={cn(
                        "h-10 rounded-none px-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-[#0a1f1a] text-white"
                          : "border border-[#1a4d42]/15 bg-white text-[#1a4d42]/70 hover:border-[#246a59]/35 dark:border-white/15 dark:bg-[#0c1a17] dark:text-white/55",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className={labelClass}>Staff type</Label>
              <Select
                value={formData.staffType}
                onValueChange={(value) =>
                  handleInputChange("staffType", value)
                }
              >
                <SelectTrigger className={selectShell}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="teaching">Teaching</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="substitute">Substitute</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className={labelClass}>Department</Label>
              <Select
                value={formData.department || undefined}
                onValueChange={(value) =>
                  handleInputChange("department", value)
                }
              >
                <SelectTrigger className={selectShell}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className={labelClass}>Position</Label>
              <Select
                value={formData.position || undefined}
                onValueChange={(value) => handleInputChange("position", value)}
              >
                <SelectTrigger className={selectShell}>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-qualifications" className={labelClass}>
                Qualifications
              </Label>
              <Input
                id="staff-qualifications"
                placeholder="e.g. B.Ed, CPA"
                value={formData.qualifications}
                onChange={(e) =>
                  handleInputChange("qualifications", e.target.value)
                }
                className={fieldShell}
                required
              />
            </div>
          </div>
        </form>

        <DrawerFooter className="shrink-0 border-t border-[#1a4d42]/12 px-5 py-4 dark:border-white/10">
          <div className="flex w-full gap-2">
            <Button
              type="submit"
              form="create-staff-form"
              disabled={isSubmitting}
              className="h-10 flex-1 gap-2 rounded-none bg-[#0a1f1a] text-white shadow-none hover:bg-[#246a59] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send invitation"
              )}
            </Button>
            <DrawerClose asChild>
              <Button
                type="button"
                variant="ghost"
                disabled={isSubmitting}
                className="h-10 rounded-none px-4 text-[#1a4d42]/70 hover:bg-[#f3f7f5] dark:text-white/55 dark:hover:bg-white/10"
              >
                Cancel
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
