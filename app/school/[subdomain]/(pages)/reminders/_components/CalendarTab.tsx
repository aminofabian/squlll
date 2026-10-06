"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CalendarPlus,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  fetchCalendarEvents,
  syncSchoolCalendar,
  type CalendarEvent,
  type CalendarEventType,
} from "@/lib/school/communicationsApi";
import { EVENT_TYPE_LABELS, EVENT_TYPE_OPTIONS, toIsoFromDateInput } from "./labels";

function DateChip({ value }: { value: string }) {
  const date = new Date(value);
  const valid = !Number.isNaN(date.getTime());
  return (
    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border bg-muted/40">
      <span className="text-sm font-semibold leading-none">
        {valid ? date.toLocaleDateString(undefined, { day: "2-digit" }) : "--"}
      </span>
      <span className="mt-0.5 text-[10px] uppercase leading-none text-muted-foreground">
        {valid ? date.toLocaleDateString(undefined, { month: "short" }) : ""}
      </span>
    </div>
  );
}

export function CalendarTab() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<CalendarEvent | null>(null);

  const [type, setType] = useState<CalendarEventType>("PARENTS_MEETING");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");

  const load = useCallback(async () => {
    try {
      setEvents(await fetchCalendarEvents());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load calendar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const resetForm = () => {
    setType("PARENTS_MEETING");
    setTitle("");
    setStartDate("");
    setEndDate("");
    setLocation("");
  };

  const onCreate = async () => {
    if (!title.trim() || !startDate) {
      toast.error("A title and start date are required.");
      return;
    }
    try {
      setBusy(true);
      await createCalendarEvent({
        type,
        title: title.trim(),
        startDate: toIsoFromDateInput(startDate),
        endDate: endDate ? toIsoFromDateInput(endDate) : undefined,
        location: location.trim() || undefined,
      });
      toast.success("Event added to the calendar");
      resetForm();
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add event");
    } finally {
      setBusy(false);
    }
  };

  const onSync = async () => {
    try {
      setSyncing(true);
      const result = await syncSchoolCalendar();
      toast.success(`Synced ${result.events} term event(s)`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const onDelete = async (event: CalendarEvent) => {
    try {
      await deleteCalendarEvent(event.id);
      toast.success("Event removed");
      setConfirm(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">School calendar</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Reminders fire off these dates. Opening, closing and half-term dates
            come from your terms.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void onSync()} disabled={syncing}>
            {syncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sync terms
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add event
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <CalendarPlus className="h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm font-medium">No dates yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Add a parents&apos; meeting or sync your school terms to pull in
                opening, closing and half-term dates.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {events.map((event) => (
                <li key={event.id} className="flex items-center gap-3 px-4 py-3">
                  <DateChip value={event.startDate} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {event.title}
                      </span>
                      <Badge variant="outline" className="shrink-0">
                        {EVENT_TYPE_LABELS[event.type]}
                      </Badge>
                      {event.source === "SYSTEM" ? (
                        <Badge variant="secondary" className="shrink-0">
                          From term
                        </Badge>
                      ) : null}
                    </div>
                    {event.location ? (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </p>
                    ) : null}
                  </div>
                  {event.source === "MANUAL" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirm(event)}
                      aria-label="Remove event"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add a calendar date</DialogTitle>
            <DialogDescription>
              One-off dates like a parents&apos; meeting or sports day. Term dates
              come from “Sync terms”.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as CalendarEventType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Form 4 parents' meeting"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End (optional)</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location (optional)</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Main hall"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void onCreate()} disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this date?</AlertDialogTitle>
            <AlertDialogDescription>
              “{confirm?.title}” will be removed from the calendar. Reminders
              tied to this event type simply won&apos;t fire for it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirm && void onDelete(confirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
