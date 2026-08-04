"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Loader2,
  X,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStaff } from "./hooks/useStaff";
import { StaffDirectorySidebar } from "./components/StaffDirectorySidebar";
import { StaffFilterBar } from "./components/StaffFilterBar";
import { StaffOverviewBar } from "./components/StaffOverviewBar";
import { StaffTable } from "./components/StaffTable";
import { StaffDetailView } from "./components/StaffDetailView";
import { StaffEmptyHero } from "./components/StaffEmptyHero";
import { CreateStaffDrawer } from "./components/CreateStaffDrawer";
import {
  matchesStaffFilter,
  staffDisplayName,
  type StaffFilter,
} from "./utils/staff-utils";
import {
  staffControlDivider,
  staffControlShell,
  staffIconButton,
  staffSearchChip,
} from "./components/staff-ui";

export default function StaffPage() {
  const searchParams = useSearchParams();
  const openAddStaff = searchParams.get("action") === "add";
  const deepLinkStaffId = searchParams.get("staffId");

  const { staff, loading, error, refetchStaff } = useStaff();

  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(10);
  const [staffFilter, setStaffFilter] = useState<StaffFilter>("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const selectedStaff = useMemo(
    () => staff.find((member) => member.id === selectedStaffId) ?? null,
    [staff, selectedStaffId],
  );

  useEffect(() => {
    if (
      deepLinkStaffId &&
      staff.some((member) => member.id === deepLinkStaffId) &&
      selectedStaffId !== deepLinkStaffId
    ) {
      setSelectedStaffId(deepLinkStaffId);
    }
  }, [deepLinkStaffId, staff, selectedStaffId]);

  const departments = useMemo(() => {
    const unique = new Set<string>();
    for (const member of staff) {
      if (member.department?.trim()) unique.add(member.department);
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [staff]);

  const roles = useMemo(() => {
    const unique = new Set<string>();
    for (const member of staff) {
      if (member.role?.trim()) unique.add(member.role);
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [staff]);

  const filteredStaff = useMemo(() => {
    let result = staff.filter((member) => matchesStaffFilter(member, staffFilter));

    if (departmentFilter !== "all") {
      result = result.filter((member) => member.department === departmentFilter);
    }

    if (roleFilter !== "all") {
      result = result.filter((member) => member.role === roleFilter);
    }

    result.sort((a, b) =>
      staffDisplayName(a).localeCompare(staffDisplayName(b)),
    );
    return result;
  }, [staff, staffFilter, departmentFilter, roleFilter]);

  const tableStaff = useMemo(() => {
    if (!searchTerm.trim()) return filteredStaff;
    const q = searchTerm.toLowerCase();
    return filteredStaff.filter(
      (member) =>
        staffDisplayName(member).toLowerCase().includes(q) ||
        (member.email?.toLowerCase().includes(q) ?? false) ||
        (member.employeeId?.toLowerCase().includes(q) ?? false) ||
        (member.department?.toLowerCase().includes(q) ?? false) ||
        (member.role?.toLowerCase().includes(q) ?? false),
    );
  }, [filteredStaff, searchTerm]);

  const filterCounts = useMemo(
    () => ({
      all: staff.length,
      active: staff.filter((member) => member.isActive).length,
      inactive: staff.filter((member) => !member.isActive).length,
      incomplete: staff.filter((member) => !member.hasCompletedProfile).length,
    }),
    [staff],
  );

  const departmentCount = departments.length;
  const activeCount = filterCounts.active;
  const inactiveCount = filterCounts.inactive;

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedStaffId(null);
    setStaffFilter("all");
    setDepartmentFilter("all");
    setRoleFilter("all");
  }, []);

  const emptyMessage =
    searchTerm ||
    departmentFilter !== "all" ||
    roleFilter !== "all" ||
    staffFilter !== "all"
      ? "No staff match your filters"
      : "No staff yet";

  if (error && staff.length === 0 && !loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f3f7f5] px-4 dark:bg-[#071411]">
        <div className="max-w-md rounded-none border border-red-300/80 bg-white px-6 py-8 text-center shadow-[3px_3px_0_0_rgba(10,31,26,0.04)] dark:border-red-900/50 dark:bg-[#0c1a17]">
          <h2 className="mb-1 font-display text-lg tracking-tight text-red-700 dark:text-red-400">
            Error loading staff
          </h2>
          <p className="text-sm text-[#1a4d42]/55 dark:text-white/45">{error}</p>
          <Button
            size="sm"
            className="mt-4 rounded-none bg-[#0a1f1a] text-white hover:bg-[#246a59]"
            onClick={() => void refetchStaff()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f7f5] dark:bg-[#071411]">
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#1a4d42]/12 bg-[#f8fbfa] transition-all duration-300 dark:border-white/10 dark:bg-[#0c1a17]",
          "md:relative md:translate-x-0",
          isSidebarMinimized ? "w-14" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 border-b border-[#1a4d42]/10 px-2 py-2 dark:border-white/10",
            isSidebarMinimized ? "justify-center" : "justify-end",
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className={staffIconButton}
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
          >
            {isSidebarMinimized ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isSidebarMinimized ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3">
            <StaffDirectorySidebar
              staff={filteredStaff}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedStaffId={selectedStaffId}
              onStaffSelect={setSelectedStaffId}
              displayedCount={displayedCount}
              onLoadMore={() => setDisplayedCount((prev) => prev + 10)}
              isLoading={loading}
            />
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-[#1a4d42]/12 bg-[#f8fbfa]/95 px-4 py-2.5 backdrop-blur-md dark:border-white/10 dark:bg-[#071411]/95 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#246a59]">
                  Workforce
                </p>
                <h1 className="font-display text-xl tracking-tight text-[#0a1f1a] dark:text-white">
                  {selectedStaff
                    ? staffDisplayName(selectedStaff)
                    : "Staff"}
                </h1>
                <p className="mt-0.5 text-xs text-[#1a4d42]/50 dark:text-white/45">
                  {selectedStaff
                    ? `${selectedStaff.department || "No department"} · ${selectedStaff.isActive ? "Active" : "Inactive"}`
                    : "Manage non-teaching staff, administrators, and support roles"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!selectedStaffId ? (
                  <CreateStaffDrawer
                    defaultOpen={openAddStaff}
                    triggerVariant="header"
                    onStaffCreated={() => {
                      void refetchStaff();
                      clearFilters();
                    }}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-5">
            {error ? (
              <div className="flex items-center gap-2 border border-amber-300/80 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                <Info className="h-4 w-4 shrink-0" />
                {error}
              </div>
            ) : null}

            {loading && staff.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-[#1a4d42]/55">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading staff…
              </div>
            ) : null}

            {selectedStaff ? (
              <StaffDetailView
                staffMember={selectedStaff}
                onClose={() => setSelectedStaffId(null)}
              />
            ) : staff.length === 0 && !loading ? (
              <StaffEmptyHero
                defaultOpen={openAddStaff}
                onStaffCreated={() => {
                  void refetchStaff();
                  clearFilters();
                }}
              />
            ) : (
              <div className="space-y-4">
                <StaffOverviewBar
                  total={staff.length}
                  active={activeCount}
                  inactive={inactiveCount}
                  departmentCount={departmentCount}
                  isLoading={loading}
                />

                {!loading && staff.length > 0 ? (
                  <div className={staffControlShell}>
                    <StaffFilterBar
                      filter={staffFilter}
                      onFilterChange={setStaffFilter}
                      counts={filterCounts}
                      departments={departments}
                      departmentFilter={departmentFilter}
                      onDepartmentFilterChange={setDepartmentFilter}
                      roles={roles}
                      roleFilter={roleFilter}
                      onRoleFilterChange={setRoleFilter}
                    />

                    <div
                      className={cn(
                        staffControlDivider,
                        "flex flex-wrap items-center justify-between gap-2",
                      )}
                    >
                      {searchTerm ? (
                        <div className="flex items-center gap-2 text-xs text-[#1a4d42]/55">
                          <span>Filtering by</span>
                          <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className={staffSearchChip}
                          >
                            &ldquo;{searchTerm}&rdquo;
                            <X className="h-3 w-3 text-[#1a4d42]/40" />
                          </button>
                        </div>
                      ) : (
                        <span />
                      )}
                      <CreateStaffDrawer
                        triggerVariant="toolbar"
                        onStaffCreated={() => void refetchStaff()}
                      />
                    </div>
                  </div>
                ) : null}

                <StaffTable
                  staff={tableStaff}
                  isLoading={loading}
                  onStaffClick={setSelectedStaffId}
                  title="All staff"
                  emptyMessage={emptyMessage}
                  showAddAction={tableStaff.length === 0}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
