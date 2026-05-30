"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  Edit2,
  Loader2,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { CreateTermModal } from "../dashboard/components/CreateTermModal";
import { EditTermDialog } from "../dashboard/components/EditTermDialog";

export interface ManagedTerm {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent: boolean;
  academicYear: {
    name: string;
  };
}

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface TermManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  terms: ManagedTerm[];
  currentAcademicYear: AcademicYear | null;
  termsLoading: boolean;
  onTermsChanged: () => void;
}

async function graphqlRequest<T>(query: string, variables: Record<string, unknown>) {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(result.errors[0]?.message || "Request failed");
  }

  return result.data as T;
}

function formatDate(dateString: string) {
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return dateString;
  }
}

export function TermManagementModal({
  open,
  onOpenChange,
  terms,
  currentAcademicYear,
  termsLoading,
  onTermsChanged,
}: TermManagementModalProps) {
  const [showCreateTermModal, setShowCreateTermModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState<ManagedTerm | null>(null);
  const [deletingTermId, setDeletingTermId] = useState<string | null>(null);
  const [isDeletingTerm, setIsDeletingTerm] = useState(false);
  const [settingCurrentTermId, setSettingCurrentTermId] = useState<string | null>(null);
  const [togglingActiveTermId, setTogglingActiveTermId] = useState<string | null>(null);

  const currentTerm = terms.find((t) => t.isCurrent);
  const deletingTerm = terms.find((t) => t.id === deletingTermId);

  const handleSetCurrent = async (term: ManagedTerm) => {
    setSettingCurrentTermId(term.id);
    try {
      await graphqlRequest<{ setCurrentTerm: { name: string } }>(
        `
          mutation SetCurrentTerm($id: ID!) {
            setCurrentTerm(id: $id) {
              id
              name
              isCurrent
            }
          }
        `,
        { id: term.id },
      );
      toast.success(`"${term.name}" is now the current term`);
      onTermsChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to set current term");
    } finally {
      setSettingCurrentTermId(null);
    }
  };

  const handleToggleActive = async (term: ManagedTerm, active: boolean) => {
    setTogglingActiveTermId(term.id);
    try {
      await graphqlRequest<{ updateTerm: { name: string } }>(
        `
          mutation UpdateTerm($id: ID!, $input: UpdateTermInput!) {
            updateTerm(id: $id, input: $input) {
              id
              name
              isActive
            }
          }
        `,
        { id: term.id, input: { isActive: active } },
      );
      toast.success(
        active
          ? `"${term.name}" has been activated`
          : `"${term.name}" has been deactivated`,
      );
      onTermsChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update term");
    } finally {
      setTogglingActiveTermId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingTermId) return;

    setIsDeletingTerm(true);
    try {
      await graphqlRequest<{ deleteTerm: boolean }>(
        `
          mutation DeleteTerm($id: ID!) {
            deleteTerm(id: $id)
          }
        `,
        { id: deletingTermId },
      );
      toast.success(`Term "${deletingTerm?.name}" deleted`);
      setDeletingTermId(null);
      onTermsChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete term");
    } finally {
      setIsDeletingTerm(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Manage Terms
            </DialogTitle>
            <DialogDescription>
              {currentAcademicYear
                ? `Set the current term and manage terms for ${currentAcademicYear.name}.`
                : "Create an academic year to manage terms."}
            </DialogDescription>
          </DialogHeader>

          {currentTerm && (
            <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50/80 dark:bg-yellow-950/30 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-yellow-900 dark:text-yellow-100">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                Current term: {currentTerm.name}
              </div>
              <p className="mt-1 text-xs text-yellow-800/80 dark:text-yellow-200/80">
                {formatDate(currentTerm.startDate)} – {formatDate(currentTerm.endDate)}
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-2 min-h-0 py-1">
            {termsLoading ? (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading terms...
              </div>
            ) : terms.length === 0 ? (
              <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  No terms yet for this academic year.
                </p>
                <Button size="sm" onClick={() => setShowCreateTermModal(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create first term
                </Button>
              </div>
            ) : (
              terms.map((term) => (
                <div
                  key={term.id}
                  className={`rounded-lg border p-3 transition-colors ${
                    term.isCurrent
                      ? "border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-950/20"
                      : term.isActive
                        ? "border-primary/20 bg-primary/5"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm">{term.name}</span>
                        {term.isCurrent && (
                          <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white border-0 text-xs">
                            Current
                          </Badge>
                        )}
                        {!term.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(term.startDate)} – {formatDate(term.endDate)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!term.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-xs border-yellow-300/60 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/40"
                          disabled={settingCurrentTermId === term.id}
                          onClick={() => handleSetCurrent(term)}
                        >
                          {settingCurrentTermId === term.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <Star className="h-3.5 w-3.5 mr-1" />
                              Set current
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingTerm(term)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => setDeletingTermId(term.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                    <Label
                      htmlFor={`term-active-${term.id}`}
                      className="text-xs text-muted-foreground cursor-pointer"
                    >
                      Active
                    </Label>
                    <div className="flex items-center gap-2">
                      {togglingActiveTermId === term.id && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      )}
                      <Switch
                        id={`term-active-${term.id}`}
                        checked={term.isActive}
                        disabled={togglingActiveTermId === term.id}
                        onCheckedChange={(checked) => handleToggleActive(term, checked)}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between gap-2 border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateTermModal(true)}
              disabled={!currentAcademicYear}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add term
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {currentAcademicYear && (
        <CreateTermModal
          isOpen={showCreateTermModal}
          onClose={() => setShowCreateTermModal(false)}
          onSuccess={(newTerm) => {
            toast.success(`Term "${newTerm.name}" created`);
            setShowCreateTermModal(false);
            onTermsChanged();
          }}
          academicYear={currentAcademicYear}
        />
      )}

      {editingTerm && currentAcademicYear && (
        <EditTermDialog
          term={{
            ...editingTerm,
            academicYear: {
              id: currentAcademicYear.id,
              name: currentAcademicYear.name,
            },
          }}
          isOpen={!!editingTerm}
          onClose={() => setEditingTerm(null)}
          onSuccess={() => {
            setEditingTerm(null);
            onTermsChanged();
          }}
        />
      )}

      <AlertDialog
        open={!!deletingTermId}
        onOpenChange={(isOpen) => !isOpen && setDeletingTermId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete term</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deletingTerm?.name}&rdquo;? This
              cannot be undone.
              {deletingTerm?.isCurrent && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400">
                  Warning: This is the current term.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingTerm}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeletingTerm}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingTerm ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
