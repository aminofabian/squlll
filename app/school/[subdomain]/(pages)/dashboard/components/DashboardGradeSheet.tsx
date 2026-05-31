"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SchoolSearchFilter } from "@/components/dashboard/SchoolSearchFilter";

interface DashboardGradeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGradeSelect: (gradeId: string, levelId: string) => void;
  onStreamSelect: (streamId: string, gradeId: string, levelId: string) => void;
  selectedGradeId: string;
  selectedStreamId: string;
  isLoading?: boolean;
}

export function DashboardGradeSheet({
  open,
  onOpenChange,
  onGradeSelect,
  onStreamSelect,
  selectedGradeId,
  selectedStreamId,
  isLoading,
}: DashboardGradeSheetProps) {
  const handleGradeSelect = (gradeId: string, levelId: string) => {
    onGradeSelect(gradeId, levelId);
    onOpenChange(false);
  };

  const handleStreamSelect = (
    streamId: string,
    gradeId: string,
    levelId: string,
  ) => {
    onStreamSelect(streamId, gradeId, levelId);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-full flex-col p-0 sm:max-w-sm">
        <SheetHeader className="border-b border-slate-200/80 px-4 py-4 text-left dark:border-slate-800">
          <SheetTitle>Browse grades</SheetTitle>
          <SheetDescription>
            Select a grade or stream to view class details and activity.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-hidden px-3 pb-4 pt-3">
          <SchoolSearchFilter
            className="h-full"
            variant="minimal"
            surface="drawer"
            type="grades"
            onGradeSelect={handleGradeSelect}
            onStreamSelect={handleStreamSelect}
            isLoading={isLoading}
            selectedGradeId={selectedGradeId}
            selectedStreamId={selectedStreamId}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
