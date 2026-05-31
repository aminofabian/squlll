"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAllTenants } from "@/lib/superadmin/tenantsApi";
import type { TenantRecord } from "@/lib/superadmin/types";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving?: boolean;
  defaultTenantId?: string;
  onSubmit: (input: {
    tenantId: string;
    email: string;
    name: string;
    role: string;
  }) => Promise<void>;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  saving,
  defaultTenantId,
  onSubmit,
}: CreateUserDialogProps) {
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [form, setForm] = useState({
    tenantId: "",
    email: "",
    name: "",
    role: "SCHOOL_ADMIN",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setError("");
    setForm({
      tenantId: defaultTenantId ?? "",
      email: "",
      name: "",
      role: "SCHOOL_ADMIN",
    });

    if (defaultTenantId) {
      setLoadingTenants(false);
      return;
    }

    setLoadingTenants(true);
    fetchAllTenants()
      .then(setTenants)
      .catch(() => setError("Could not load schools for this form"))
      .finally(() => setLoadingTenants(false));
  }, [open, defaultTenantId]);

  const handleSubmit = async () => {
    setError("");
    if (!form.tenantId || !form.email.trim() || !form.name.trim()) {
      setError("School, name, and email are required");
      return;
    }

    try {
      await onSubmit({
        tenantId: form.tenantId,
        email: form.email.trim(),
        name: form.name.trim(),
        role: form.role,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Add a staff member or school admin to an existing school.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!defaultTenantId ? (
            <div className="space-y-2">
              <Label>School</Label>
              <Select
                value={form.tenantId}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, tenantId: value }))
                }
                disabled={loadingTenants}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue
                    placeholder={
                      loadingTenants ? "Loading schools..." : "Select a school"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              placeholder="John Doe"
              className="rounded-xl"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="john@school.com"
              className="rounded-xl"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={form.role}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, role: value }))
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHOOL_ADMIN">School admin</SelectItem>
                <SelectItem value="SCHOOL_MANAGER">School manager</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950">
              {error}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            className="rounded-xl"
            onClick={handleSubmit}
            disabled={saving || loadingTenants}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create user"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
