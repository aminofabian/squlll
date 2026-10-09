"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDisplayErrorMessage } from "@/lib/utils/graphql-errors";
import {
  adminChangeDriverEmail,
  adminChangeDriverPassword,
  fetchDrivers,
  onboardDriver,
  removeDriver,
  updateDriver,
  type TransportDriver,
} from "@/lib/school/transportApi";

const EMPTY = {
  email: "",
  name: "",
  phoneNumber: "",
  licenseNo: "",
  password: "",
  notes: "",
};

/** Short, human-friendly temporary password (no ambiguous characters). */
function randomPassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  const values = new Uint32Array(10);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => chars[v % chars.length]).join("");
}

export function DriversPanel() {
  const [rows, setRows] = useState<TransportDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [tempPassword, setTempPassword] = useState<{ name: string; password: string } | null>(
    null,
  );
  const [loginDriver, setLoginDriver] = useState<TransportDriver | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await fetchDrivers());
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const rows = await fetchDrivers();
        if (active) setRows(rows);
      } catch (err) {
        toast.error(getDisplayErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const submit = async () => {
    if (!form.email.trim() || !form.name.trim()) {
      toast.error("Email and name are required to create a driver account");
      return;
    }
    setBusy(true);
    try {
      const result = await onboardDriver({
        email: form.email.trim(),
        name: form.name.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        licenseNo: form.licenseNo.trim() || undefined,
        password: form.password.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      toast.success(result.accountCreated ? "Driver account created" : "Driver linked");
      if (result.generatedPassword) {
        setTempPassword({
          name: result.user?.name ?? form.name.trim(),
          password: result.generatedPassword,
        });
      }
      setOpen(false);
      setForm(EMPTY);
      await load();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (d: TransportDriver) => {
    try {
      await updateDriver({ id: d.id, isActive: !d.isActive });
      await load();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    }
  };

  const remove = async (d: TransportDriver) => {
    const name = d.user?.name ?? d.user?.email ?? "this driver";
    if (!window.confirm(`Remove ${name}? Their user account is kept.`)) return;
    try {
      await removeDriver(d.id);
      toast.success("Driver removed");
      await load();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    }
  };

  const openLogin = (d: TransportDriver) => {
    setLoginDriver(d);
    setLoginEmail(d.user?.email ?? "");
    setLoginPassword("");
  };

  const closeLogin = () => {
    setLoginDriver(null);
    setLoginPassword("");
  };

  const saveLogin = async () => {
    if (!loginDriver) return;
    const currentEmail = (loginDriver.user?.email ?? "").trim().toLowerCase();
    const nextEmail = loginEmail.trim().toLowerCase();
    const nextPassword = loginPassword.trim();

    const emailChanged = Boolean(nextEmail) && nextEmail !== currentEmail;
    if (!emailChanged && !nextPassword) {
      toast.error("Enter a new email or a new password");
      return;
    }

    setLoginBusy(true);
    try {
      // The driver signs in with email + password, so update whichever changed.
      if (emailChanged) {
        await adminChangeDriverEmail(loginDriver.userId, nextEmail);
      }
      if (nextPassword) {
        await adminChangeDriverPassword(loginDriver.userId, nextPassword);
      }
      toast.success("Driver login updated");
      closeLogin();
      await load();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setLoginBusy(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Drivers & conductors</h2>
        <Button onClick={() => setOpen(true)}>Onboard driver</Button>
      </div>

      {tempPassword && (
        <div className="rounded-md border border-primary/40 bg-primary/5 p-3 text-sm">
          <p className="font-medium">Temporary password for {tempPassword.name}</p>
          <p className="mt-1">
            <code className="rounded bg-muted px-1.5 py-0.5">{tempPassword.password}</code> — share
            it securely; they can change it after signing in.
          </p>
          <button
            type="button"
            className="mt-2 text-xs text-muted-foreground underline"
            onClick={() => setTempPassword(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No drivers yet. Onboard one to assign them to trips.
        </p>
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Licence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.user?.name ?? "—"}</TableCell>
                  <TableCell>{d.user?.email ?? "—"}</TableCell>
                  <TableCell>{d.phoneNumber ?? "—"}</TableCell>
                  <TableCell>{d.licenseNo ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={d.isActive ? "default" : "secondary"}>
                      {d.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openLogin(d)}>
                      Login
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggle(d)}>
                      {d.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(d)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Onboard driver</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="d-name">Name</Label>
                <Input
                  id="d-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="d-email">Email</Label>
                <Input
                  id="d-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="d-phone">Phone</Label>
                <Input
                  id="d-phone"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="d-licence">Licence</Label>
                <Input
                  id="d-licence"
                  value={form.licenseNo}
                  onChange={(e) => setForm({ ...form, licenseNo: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-password">Initial password (optional)</Label>
              <Input
                id="d-password"
                value={form.password}
                placeholder="Leave blank to generate one"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={busy}>
              {busy ? "Saving…" : "Onboard"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(loginDriver)}
        onOpenChange={(next) => {
          if (!next) closeLogin();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Change login
              {loginDriver?.user?.name ? ` — ${loginDriver.user.name}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="d-login-email">Email</Label>
              <Input
                id="d-login-email"
                type="email"
                autoComplete="off"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The email this driver signs in with.
              </p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-login-password">New password</Label>
              <div className="flex gap-2">
                <Input
                  id="d-login-password"
                  autoComplete="new-password"
                  value={loginPassword}
                  placeholder="Leave blank to keep the current password"
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLoginPassword(randomPassword())}
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Setting a password signs the driver out everywhere and invalidates
                their previous sessions.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeLogin}>
              Cancel
            </Button>
            <Button onClick={saveLogin} disabled={loginBusy}>
              {loginBusy ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
