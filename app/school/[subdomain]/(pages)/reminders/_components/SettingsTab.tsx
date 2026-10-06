"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import {
  addOptOut,
  fetchOptOuts,
  removeOptOut,
  updateCommunicationSettings,
  type CommunicationOptOut,
  type CommunicationSettings,
  type OptOutChannel,
} from "@/lib/school/communicationsApi";

export function SettingsTab({
  settings,
  loading,
  onChanged,
}: {
  settings: CommunicationSettings | null;
  loading: boolean;
  onChanged: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<Partial<CommunicationSettings>>({});
  const [saving, setSaving] = useState(false);

  const [optOuts, setOptOuts] = useState<CommunicationOptOut[]>([]);
  const [optOutsLoading, setOptOutsLoading] = useState(true);
  const [newOptOutChannel, setNewOptOutChannel] = useState<OptOutChannel>("ALL");
  const [newOptOutContact, setNewOptOutContact] = useState("");
  const [addingOptOut, setAddingOptOut] = useState(false);

  const form: CommunicationSettings | null = settings
    ? { ...settings, ...draft }
    : null;

  const loadOptOuts = useCallback(async () => {
    try {
      setOptOuts(await fetchOptOuts());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load opt-outs");
    } finally {
      setOptOutsLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await loadOptOuts();
    })();
  }, [loadOptOuts]);

  const patch = (next: Partial<CommunicationSettings>) => {
    setDraft((prev) => ({ ...prev, ...next }));
  };

  const setChannelFlag = (
    key: "smsEnabled" | "emailEnabled" | "inAppEnabled",
    value: boolean,
  ) => {
    patch({ [key]: value } as Partial<CommunicationSettings>);
  };

  const onSave = async () => {
    if (!form) return;
    try {
      setSaving(true);
      await updateCommunicationSettings(form);
      setDraft({});
      toast.success("Settings saved");
      await onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const onAddOptOut = async () => {
    const contact = newOptOutContact.trim();
    if (!contact) {
      toast.error("Enter a phone number or email.");
      return;
    }
    const isEmail = contact.includes("@");
    try {
      setAddingOptOut(true);
      await addOptOut({
        channel: newOptOutChannel,
        ...(isEmail ? { email: contact } : { phone: contact }),
      });
      toast.success("Opt-out added");
      setNewOptOutContact("");
      await loadOptOuts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add opt-out");
    } finally {
      setAddingOptOut(false);
    }
  };

  const onRemoveOptOut = async (row: CommunicationOptOut) => {
    try {
      await removeOptOut(row.id);
      await loadOptOuts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Channels & sending rules</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Control how and when reminders go out, and who is excluded.
        </p>
      </div>

      {loading || !form ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Channels & quiet hours</CardTitle>
              <CardDescription>
                SMS respects your quiet hours and daily cap; email and in-app send
                any time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  ["smsEnabled", "SMS"],
                  ["emailEnabled", "Email"],
                  ["inAppEnabled", "In-app notifications"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label>{label}</Label>
                  <Switch
                    checked={form[key]}
                    onCheckedChange={(v) => setChannelFlag(key, v)}
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-2">
                  <Label>Quiet hours from</Label>
                  <Input
                    type="time"
                    value={form.quietHoursStart ?? ""}
                    onChange={(e) =>
                      patch({ quietHoursStart: e.target.value || null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quiet hours to</Label>
                  <Input
                    type="time"
                    value={form.quietHoursEnd ?? ""}
                    onChange={(e) =>
                      patch({ quietHoursEnd: e.target.value || null })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Daily SMS cap</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.dailySmsCap ?? ""}
                  onChange={(e) =>
                    patch({
                      dailySmsCap:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  placeholder="Leave blank for no cap"
                />
              </div>

              <div className="space-y-2">
                <Label>Opt-out footer</Label>
                <Input
                  value={form.optOutFooter ?? ""}
                  onChange={(e) => patch({ optOutFooter: e.target.value || null })}
                  placeholder="Reply STOP to opt out."
                />
                <p className="text-[11px] text-muted-foreground">
                  Appended to every reminder SMS.
                </p>
              </div>

              <Button onClick={() => void onSave()} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Opt-outs</CardTitle>
              <CardDescription>
                Numbers here are skipped by the dispatcher — respect guardian
                consent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-2">
                  <Label className="text-xs">Channel</Label>
                  <Select
                    value={newOptOutChannel}
                    onValueChange={(v) => setNewOptOutChannel(v as OptOutChannel)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[12rem] flex-1 space-y-2">
                  <Label className="text-xs">Phone or email</Label>
                  <Input
                    value={newOptOutContact}
                    onChange={(e) => setNewOptOutContact(e.target.value)}
                    placeholder="07XX XXX XXX or parent@email.com"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => void onAddOptOut()}
                  disabled={addingOptOut}
                >
                  {addingOptOut ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Add
                </Button>
              </div>

              {optOutsLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : optOuts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No opt-outs recorded.
                </p>
              ) : (
                <ul className="divide-y">
                  {optOuts.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center justify-between gap-2 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm">{row.phone || row.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.reason || "Opted out"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {row.channel}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => void onRemoveOptOut(row)}
                          aria-label="Remove opt-out"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
