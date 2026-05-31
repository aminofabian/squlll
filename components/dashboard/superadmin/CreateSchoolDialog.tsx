"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { fetchPlans } from "@/lib/superadmin/plansApi";
import type { PlanRecord } from "@/lib/superadmin/plans";
import type { CreateTenantInput, CreateTenantResult } from "@/lib/superadmin/tenantsApi";

function slugifySubdomain(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface CreateSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving?: boolean;
  onSubmit: (input: CreateTenantInput) => Promise<CreateTenantResult>;
}

export function CreateSchoolDialog({
  open,
  onOpenChange,
  saving,
  onSubmit,
}: CreateSchoolDialogProps) {
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [subdomainTouched, setSubdomainTouched] = useState(false);
  const [form, setForm] = useState({
    name: "",
    subdomain: "",
    description: "",
    adminEmail: "",
    adminName: "",
    planId: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<CreateTenantResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;

    setError("");
    setSuccess(null);
    setCopied(false);
    setSubdomainTouched(false);
    setForm({
      name: "",
      subdomain: "",
      description: "",
      adminEmail: "",
      adminName: "",
      planId: "",
    });

    setLoadingPlans(true);
    fetchPlans()
      .then(setPlans)
      .catch(() => setError("Could not load plans"))
      .finally(() => setLoadingPlans(false));
  }, [open]);

  const defaultPlanId = useMemo(
    () => plans.find((plan) => plan.isDefault)?.id ?? plans[0]?.id,
    [plans],
  );

  const handleNameChange = (name: string) => {
    setForm((current) => ({
      ...current,
      name,
      subdomain: subdomainTouched ? current.subdomain : slugifySubdomain(name),
    }));
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.name.trim()) {
      setError("School name is required");
      return;
    }
    if (!form.subdomain.trim()) {
      setError("Subdomain is required");
      return;
    }
    if (form.adminEmail.trim() && !form.adminName.trim()) {
      setError("Admin name is required when admin email is provided");
      return;
    }
    if (form.adminName.trim() && !form.adminEmail.trim()) {
      setError("Admin email is required when admin name is provided");
      return;
    }

    try {
      const result = await onSubmit({
        name: form.name.trim(),
        subdomain: form.subdomain.trim(),
        description: form.description.trim() || undefined,
        adminEmail: form.adminEmail.trim() || undefined,
        adminName: form.adminName.trim() || undefined,
        planId: form.planId
          ? Number(form.planId)
          : defaultPlanId
            ? Number(defaultPlanId)
            : undefined,
      });
      setSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create school");
    }
  };

  const copyPassword = async () => {
    if (!success?.adminTempPassword) return;
    await navigator.clipboard.writeText(success.adminTempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        {success ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                School created
              </DialogTitle>
              <DialogDescription>
                <strong>{success.tenant.name}</strong> is ready at subdomain{" "}
                <strong>{success.tenant.subdomain}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {success.adminTempPassword ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    Temporary admin password
                  </p>
                  <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-300/80">
                    Share this once with the school admin. It will not be shown
                    again.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-white px-3 py-2 font-mono text-sm dark:bg-slate-900">
                      {success.adminTempPassword}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={copyPassword}
                    >
                      {copied ? (
                        "Copied"
                      ) : (
                        <>
                          <Copy className="mr-1 h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No admin user was created. You can add one later from the
                  Users page.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                className="rounded-xl"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add school</DialogTitle>
              <DialogDescription>
                Register a new school, assign a plan, and optionally create the
                first admin account.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="school-name">School name</Label>
                <Input
                  id="school-name"
                  className="rounded-xl"
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="Green Valley Academy"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school-subdomain">Subdomain</Label>
                <Input
                  id="school-subdomain"
                  className="rounded-xl"
                  value={form.subdomain}
                  onChange={(event) => {
                    setSubdomainTouched(true);
                    setForm((current) => ({
                      ...current,
                      subdomain: slugifySubdomain(event.target.value),
                    }));
                  }}
                  placeholder="green-valley-academy"
                />
                <p className="text-xs text-slate-500">
                  Used for the school URL (lowercase letters, numbers, hyphens).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school-description">Description (optional)</Label>
                <Textarea
                  id="school-description"
                  className="min-h-[72px] rounded-xl"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Brief note about this school"
                />
              </div>

              <div className="space-y-2">
                <Label>Subscription plan</Label>
                <Select
                  value={form.planId || (defaultPlanId ? String(defaultPlanId) : "")}
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, planId: value }))
                  }
                  disabled={loadingPlans || saving}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={String(plan.id)}>
                        {plan.name}
                        {plan.isDefault ? " (default)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-xl border border-slate-200/60 p-4 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  First admin (optional)
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Creates a school admin with a temporary password you can share.
                </p>
                <div className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="admin-name">Admin name</Label>
                    <Input
                      id="admin-name"
                      className="rounded-xl"
                      value={form.adminName}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          adminName: event.target.value,
                        }))
                      }
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      className="rounded-xl"
                      value={form.adminEmail}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          adminEmail: event.target.value,
                        }))
                      }
                      placeholder="admin@school.edu"
                    />
                  </div>
                </div>
              </div>

              {error ? (
                <p className="text-sm text-red-600">{error}</p>
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
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create school"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
