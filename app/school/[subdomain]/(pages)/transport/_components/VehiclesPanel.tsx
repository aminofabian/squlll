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
  createVehicle,
  fetchVehicles,
  removeVehicle,
  updateVehicle,
  type TransportVehicle,
} from "@/lib/school/transportApi";

const EMPTY = { label: "", registrationNo: "", capacity: "", notes: "" };

export function VehiclesPanel() {
  const [rows, setRows] = useState<TransportVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const load = useCallback(async () => {
    try {
      setRows(await fetchVehicles());
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
        const rows = await fetchVehicles();
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
    if (!form.label.trim()) {
      toast.error("Label is required");
      return;
    }
    setBusy(true);
    try {
      await createVehicle({
        label: form.label.trim(),
        registrationNo: form.registrationNo.trim() || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        notes: form.notes.trim() || undefined,
      });
      toast.success("Vehicle added");
      setOpen(false);
      setForm(EMPTY);
      await load();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (v: TransportVehicle) => {
    try {
      await updateVehicle({ id: v.id, isActive: !v.isActive });
      await load();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    }
  };

  const remove = async (v: TransportVehicle) => {
    if (!window.confirm(`Remove ${v.label}?`)) return;
    try {
      await removeVehicle(v.id);
      toast.success("Vehicle removed");
      await load();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Vehicles</h2>
        <Button onClick={() => setOpen(true)}>Add vehicle</Button>
      </div>

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No vehicles yet. Add one to start assigning it to trips.
        </p>
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.label}</TableCell>
                  <TableCell>{v.registrationNo ?? "—"}</TableCell>
                  <TableCell>{v.capacity ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={v.isActive ? "default" : "secondary"}>
                      {v.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => toggle(v)}>
                      {v.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(v)}>
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
            <DialogTitle>Add vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="v-label">Label</Label>
              <Input
                id="v-label"
                value={form.label}
                placeholder="Bus 04"
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="v-reg">Registration</Label>
                <Input
                  id="v-reg"
                  value={form.registrationNo}
                  placeholder="KDA 123A"
                  onChange={(e) => setForm({ ...form, registrationNo: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="v-cap">Capacity</Label>
                <Input
                  id="v-cap"
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="v-notes">Notes</Label>
              <Input
                id="v-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
