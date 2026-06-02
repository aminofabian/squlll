"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { graphqlClient } from "@/lib/graphql-client";
import { gql } from "graphql-request";
import { getTenantInfo } from "@/lib/utils";
import { parentsPanel } from "./parents-ui";
import { toast } from "sonner";
import { Loader2, Plus, Search, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { relationshipBadgeClass, formatRelationship } from "../utils/parents-utils";

const SEARCH_AVAILABLE = gql`
  query SearchAvailableStudentsForParent(
    $parentId: String!
    $tenantId: String!
    $searchTerm: String
  ) {
    searchAvailableStudentsForParent(
      parentId: $parentId
      tenantId: $tenantId
      searchTerm: $searchTerm
    ) {
      id
      name
      admissionNumber
      grade
      phone
    }
  }
`;

const ADD_STUDENTS = gql`
  mutation AddStudentsToParent(
    $parentId: String!
    $studentIds: [String!]!
    $tenantId: String!
  ) {
    addStudentsToParent(
      parentId: $parentId
      studentIds: $studentIds
      tenantId: $tenantId
    )
  }
`;

type AvailableStudent = {
  id: string;
  name: string;
  admissionNumber: string;
  grade: string;
  phone?: string;
};

interface ParentChildrenEditorProps {
  parentId: string;
  students: {
    id: string;
    name: string;
    grade: string;
    admissionNumber: string;
    relationship: string;
    isPrimary: boolean;
  }[];
  onUpdated?: () => void;
}

export function ParentChildrenEditor({
  parentId,
  students,
  onUpdated,
}: ParentChildrenEditorProps) {
  const tenantId = getTenantInfo()?.tenantId;
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<AvailableStudent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!tenantId || !searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const response = await graphqlClient.request<{
        searchAvailableStudentsForParent: AvailableStudent[];
      }>(SEARCH_AVAILABLE, {
        parentId,
        tenantId,
        searchTerm: searchTerm.trim(),
      });

      setResults(response.searchAvailableStudentsForParent ?? []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to search students",
      );
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [parentId, searchTerm, tenantId]);

  const handleAddStudent = async (studentId: string) => {
    if (!tenantId) return;

    setAddingId(studentId);
    try {
      await graphqlClient.request(ADD_STUDENTS, {
        parentId,
        studentIds: [studentId],
        tenantId,
      });

      toast.success("Student linked to parent");
      setResults((prev) => prev.filter((s) => s.id !== studentId));
      onUpdated?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to link student",
      );
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className={`${parentsPanel} overflow-hidden`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Linked children
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            {students.length} student{students.length !== 1 ? "s" : ""} linked
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => setShowSearch((v) => !v)}
        >
          <UserPlus className="h-3.5 w-3.5" />
          {showSearch ? "Hide search" : "Link student"}
        </Button>
      </div>

      {showSearch ? (
        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
          <div className="flex gap-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSearch();
              }}
              placeholder="Search by student name…"
              className="h-8 text-xs"
            />
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => void handleSearch()}
              disabled={isSearching || !searchTerm.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5" />
              )}
              Search
            </Button>
          </div>

          {results.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {results.map((student) => (
                <li
                  key={student.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/30"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {student.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {student.grade} · {student.admissionNumber}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-xs"
                    disabled={addingId === student.id}
                    onClick={() => void handleAddStudent(student.id)}
                  >
                    {addingId === student.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    Link
                  </Button>
                </li>
              ))}
            </ul>
          ) : searchTerm && !isSearching ? (
            <p className="mt-2 text-xs text-slate-400">
              No available students found. Try a different name.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-3 p-4 sm:p-5">
        {students.length === 0 ? (
          <p className="rounded-lg bg-slate-50/80 px-3 py-2.5 text-xs text-slate-400 dark:bg-slate-800/30">
            No children linked yet. Use &ldquo;Link student&rdquo; to add one.
          </p>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-3 dark:border-slate-800 dark:bg-slate-800/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {student.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {student.grade} · {student.admissionNumber}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {student.isPrimary ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50 text-[10px] font-medium text-emerald-700"
                    >
                      Primary contact
                    </Badge>
                  ) : null}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-medium capitalize",
                      relationshipBadgeClass(student.relationship),
                    )}
                  >
                    {formatRelationship(student.relationship)}
                  </Badge>
                </div>
              </div>
              <a
                href={`/students?studentId=${student.id}`}
                className="mt-2 inline-block text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                View in students →
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
