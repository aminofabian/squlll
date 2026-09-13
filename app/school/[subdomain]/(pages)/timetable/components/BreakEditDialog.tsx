"use client";

import { useState, useEffect } from "react";
import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";
import type { Break } from "@/lib/types/timetable";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";
import { sanitizeTimetableUserMessage } from "@/lib/utils/timetable-user-messages";
import {
  ALL_BREAK_TYPE_OPTIONS,
  breakTypeToFormValue,
  getBreakTypeOption,
} from "@/lib/utils/timetable-break-types";

interface BreakEditDialogProps {
  breakData: (Break & { isNew?: boolean }) | null;
  onClose: () => void;
}

export function BreakEditDialog({ breakData, onClose }: BreakEditDialogProps) {
  const {
    timeSlots,
    updateBreak,
    addBreak,
    deleteBreak,
    loadDayTemplatePeriods,
    loadBreaks,
  } = useTimetableStore();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "SHORT_BREAK",
    afterPeriod: 0,
    durationMinutes: 15,
    icon: "☕",
    color: "#3B82F6",
  });
  const [applyToAllDays, setApplyToAllDays] = useState(false);

  useEffect(() => {
    if (breakData && !breakData.isNew) {
      // Editing existing break
      setFormData({
        name: breakData.name,
        type: breakTypeToFormValue(breakData.type),
        afterPeriod: breakData.afterPeriod,
        durationMinutes: breakData.durationMinutes,
        icon: breakData.icon || "☕",
        color: breakData.color || "#3B82F6",
      });
      setApplyToAllDays(breakData.applyToAllDays || false);
    } else if (breakData && breakData.isNew) {
      // Creating new break
      const selectedType = ALL_BREAK_TYPE_OPTIONS[1]; // SHORT_BREAK
      setFormData({
        name: selectedType.label,
        type: selectedType.gql,
        afterPeriod: breakData.afterPeriod || 0,
        durationMinutes: 15,
        icon: selectedType.icon,
        color: selectedType.color,
      });
      // Default to all weekdays unless adding for one day via "+ Add" on a break row
      setApplyToAllDays(breakData.dayOfWeek == null);
    }
  }, [breakData]);

  const handleTypeChange = (type: string) => {
    const selectedType = getBreakTypeOption(type);
    if (!selectedType) return;

    // Only replace the name when the user has not typed a custom one — i.e.
    // the current name is still the previous type's default (or empty).
    const previousType = getBreakTypeOption(formData.type);
    const currentName = formData.name.trim();
    const shouldAutoFillName =
      !currentName ||
      (previousType ? currentName === previousType.label : false);

    setFormData({
      ...formData,
      type,
      name: shouldAutoFillName ? selectedType.label : formData.name,
      icon: selectedType.icon,
      color: selectedType.color,
    });
  };

  const handleSave = async () => {
    if (!breakData || !formData.name.trim()) return;

    setIsSaving(true);

    try {
      if (breakData.isNew) {
        // Get dayTemplateId from timeSlots
        const slotWithTemplate = timeSlots.find((s) => s.dayTemplateId);
        if (!slotWithTemplate?.dayTemplateId) {
          await loadDayTemplatePeriods();
          const refreshed = useTimetableStore.getState().timeSlots;
          const refreshedSlot = refreshed.find((s) => s.dayTemplateId);
          if (!refreshedSlot?.dayTemplateId) {
            throw new Error(
              "No day template found. Please load a day template first.",
            );
          }
        }

        const dayTemplateId =
          slotWithTemplate?.dayTemplateId ||
          useTimetableStore.getState().timeSlots.find((s) => s.dayTemplateId)
            ?.dayTemplateId;

        if (!dayTemplateId) {
          throw new Error("No day template ID available");
        }

        // Call GraphQL mutation
        const mutation = `
          mutation CreateTimetableBreak($input: CreateDayTemplateBreakInput!) {
            createTimetableBreak(input: $input) {
              id
              name
              type
              afterPeriod
              durationMinutes
              icon
              color
            }
          }
        `;

        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          credentials: "include",
          body: JSON.stringify({
            query: mutation,
            variables: {
              input: {
                dayTemplateId,
                name: formData.name,
                type: formData.type,
                afterPeriod: formData.afterPeriod,
                durationMinutes: formData.durationMinutes,
                icon: formData.icon,
                color: formData.color,
                applyToAllDays,
              },
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
          );
        }

        const result = await response.json();

        if (result.errors) {
          const errorMessages = result.errors
            .map((e: any) => e.message)
            .join(", ");
          throw new Error(`GraphQL errors: ${errorMessages}`);
        }

        if (!result.data || !result.data.createTimetableBreak) {
          throw new Error("Invalid response format");
        }

        // Close dialog - parent will reload data
        onClose();
      } else {
        // Update existing break using GraphQL mutation
        // Following the documented updateDayTemplateBreak mutation
        const mutation = `
          mutation UpdateDayTemplateBreak($id: ID!, $input: UpdateDayTemplateBreakInput!) {
            updateDayTemplateBreak(id: $id, input: $input) {
              id
              name
              type
              afterPeriod
              durationMinutes
              icon
              color
              applyToAllDays
              dayTemplateId
            }
          }
        `;

        // Build input - only send changed fields
        const input: any = {
          name: formData.name,
          type: formData.type,
          afterPeriod: formData.afterPeriod,
          durationMinutes: formData.durationMinutes,
          icon: formData.icon,
          color: formData.color,
          applyToAllDays,
        };

        // Pass existing dayTemplateId if available; backend can handle null
        if (breakData.dayTemplateId) {
          input.dayTemplateId = breakData.dayTemplateId;
        }

        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          credentials: "include",
          body: JSON.stringify({
            query: mutation,
            variables: {
              id: breakData.id,
              input,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
          );
        }

        const result = await response.json();

        if (result.errors) {
          const errorMessages = result.errors
            .map((e: any) => e.message)
            .join(", ");
          throw new Error(`GraphQL errors: ${errorMessages}`);
        }

        if (!result.data || !result.data.updateDayTemplateBreak) {
          throw new Error(
            "Invalid response format: missing updateDayTemplateBreak data",
          );
        }

        // Close dialog - parent will reload data to reflect updated break timing
        onClose();
      }
    } catch (error) {
      console.error("Error saving break:", error);
      toast({
        title: "Could not save break",
        description: sanitizeTimetableUserMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (breakData && !breakData.isNew && confirm("Delete this break?")) {
      try {
        setIsSaving(true);
        await deleteBreak(breakData.id);
        onClose();
      } catch (error) {
        console.error("Failed to delete break:", error);
        toast({
          title: "Could not delete break",
          description: sanitizeTimetableUserMessage(error),
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (!breakData) return null;

  const isNew = breakData.isNew;
  const selectedType = getBreakTypeOption(formData.type);

  return (
    <Drawer open={!!breakData} onOpenChange={onClose} direction="right">
      <DrawerContent className="flex h-full w-full flex-col rounded-none sm:w-[500px]">
        <DrawerHeader className="border-b border-[#1a4d42]/12 bg-[#f8fbfa] px-6 py-4 dark:border-white/10 dark:bg-[#071411]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DrawerTitle className={cn("flex items-center gap-3", tt.text.display, tt.ink.strong)}>
                <span className="text-2xl">{formData.icon}</span>
                <span>{isNew ? "Add Break" : "Edit Break"}</span>
              </DrawerTitle>
              <DrawerDescription className={cn("mt-2", tt.text.small, tt.ink.muted)}>
                {isNew
                  ? "Add a new break time to the timetable schedule."
                  : "Edit the break details including type, duration, and timing."}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className={cn("h-8 w-8 hover:bg-[#e8f2ef] dark:hover:bg-white/5", tt.ink.base, tt.focus)}>
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 space-y-5 overflow-y-auto bg-white px-6 py-6 dark:bg-[#0c1a17]">
          {/* Break Type */}
          <div className="space-y-1.5">
            <Label htmlFor="type" className={cn("font-medium", tt.text.caption, tt.ink.muted)}>
              Break Type
            </Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger id="type" className={cn("h-11 border-[#1a4d42]/12 dark:border-white/10")}>
                <div className="flex items-center gap-2">
                  {selectedType && (
                    <>
                      <span className="text-lg">{selectedType.icon}</span>
                      <span className="font-medium">{selectedType.label}</span>
                    </>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                {ALL_BREAK_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type.gql} value={type.gql}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{type.icon}</span>
                      <span className="font-medium">{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Break Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className={cn("font-medium", tt.text.caption, tt.ink.muted)}>
              Break Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Morning Break"
              className="h-11 border-[#1a4d42]/12 dark:border-white/10"
            />
          </div>

          {/* After Period */}
          <div className="space-y-1.5">
            <Label htmlFor="afterPeriod" className={cn("font-medium", tt.text.caption, tt.ink.muted)}>
              Position
            </Label>
            <Select
              value={formData.afterPeriod.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, afterPeriod: parseInt(value) })
              }
            >
              <SelectTrigger id="afterPeriod" className={cn("h-11 border-[#1a4d42]/12 dark:border-white/10")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">
                  Before Period 1 (start of day)
                </SelectItem>
                {Array.from(
                  new Map(
                    timeSlots.map((slot) => [slot.periodNumber, slot]),
                  ).values(),
                )
                  .sort((a, b) => a.periodNumber - b.periodNumber)
                  .map((slot, i, arr) => (
                    <SelectItem
                      key={slot.periodNumber}
                      value={slot.periodNumber.toString()}
                    >
                      After Period {slot.periodNumber} ({slot.time})
                      {i < arr.length - 1
                        ? ` → before Period ${slot.periodNumber + 1}`
                        : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className={cn(tt.text.caption, tt.ink.muted, tt.numeral)}>
              {formData.afterPeriod === 0
                ? "Break appears before all periods."
                : `Break appears after Period ${formData.afterPeriod} (before Period ${formData.afterPeriod + 1}).`}
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <Label htmlFor="duration" className={cn("font-medium", tt.text.caption, tt.ink.muted)}>
              Duration (minutes)
            </Label>
            <Input
              id="duration"
              type="number"
              min="5"
              max="120"
              value={formData.durationMinutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  durationMinutes: parseInt(e.target.value) || 15,
                })
              }
              className={cn("h-11 border-[#1a4d42]/12 dark:border-white/10", tt.numeral)}
            />
            <p className={cn(tt.text.caption, tt.ink.faint, tt.numeral)}>
              Typical: 15 min (short), 45 min (lunch)
            </p>
          </div>

          {/* Apply to All Days */}
          <div className="flex items-center space-x-3 rounded-none border border-[#1a4d42]/12 bg-[#f8fbfa] p-4 dark:border-white/10 dark:bg-white/[0.02]">
            <Checkbox
              id="applyToAllDays"
              checked={applyToAllDays}
              onCheckedChange={(checked) => setApplyToAllDays(checked === true)}
            />
            <Label
              htmlFor="applyToAllDays"
              className={cn("flex-1 cursor-pointer font-medium", tt.text.small, tt.ink.strong)}
            >
              Apply to all weekdays (Monday-Friday)
            </Label>
          </div>

          {/* Preview */}
          <div
            className="border-l-4 p-4 rounded-none"
            style={{ borderColor: formData.color }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center bg-[#e8f2ef] text-3xl dark:bg-white/10">
                {formData.icon}
              </div>
              <div className="flex-1">
                <div className={cn(tt.text.title, tt.ink.strong)}>{formData.name}</div>
                <div className={cn(tt.text.body, tt.ink.muted, tt.numeral)}>
                  {formData.durationMinutes} minutes • After Period{" "}
                  {formData.afterPeriod}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="gap-3 border-t border-[#1a4d42]/12 bg-[#f8fbfa] px-6 py-4 dark:border-white/10 dark:bg-[#071411]">
          <div className="flex w-full gap-3">
            {!isNew && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                className={cn("flex-1", tt.focus)}
              >
                Delete
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className={cn("flex-1 border-[#1a4d42]/12 hover:bg-[#e8f2ef] dark:border-white/10 dark:hover:bg-white/10", tt.ink.base, tt.focus)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name.trim() || isSaving}
              className={cn("flex-1", tt.accentBtn, tt.focus)}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isNew ? (
                "Add Break"
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
