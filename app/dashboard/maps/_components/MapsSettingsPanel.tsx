"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDisplayErrorMessage } from "@/lib/utils/graphql-errors";
import {
  fetchPlatformMapSettings,
  updatePlatformMapSettings,
  type MapProviderKind,
} from "@/lib/superadmin/mapsApi";

const PROVIDERS: { value: MapProviderKind; label: string }[] = [
  { value: "MAPTILER", label: "MapTiler" },
  { value: "PROTOTOMAPS", label: "Protomaps" },
  { value: "STADIA", label: "Stadia" },
  { value: "CUSTOM", label: "Custom (any style JSON URL)" },
];

const EXAMPLE_STYLE =
  "https://api.maptiler.com/maps/streets-v2/style.json?key={key}";

/** The provider implied by a style URL's host, mirroring the API's heuristics. */
function providerFromStyleUrl(url: string): MapProviderKind | null {
  const value = url.trim().toLowerCase();
  if (!value) return null;
  if (value.includes("stadiamaps.com")) return "STADIA";
  if (value.includes("maptiler.com")) return "MAPTILER";
  if (value.includes("protomaps")) return "PROTOTOMAPS";
  return null;
}

function providerLabel(value: MapProviderKind): string {
  return PROVIDERS.find((provider) => provider.value === value)?.label ?? value;
}

interface Form {
  enabled: boolean;
  provider: MapProviderKind;
  styleUrl: string;
  apiKey: string;
  attribution: string;
}

const EMPTY: Form = {
  enabled: false,
  provider: "MAPTILER",
  styleUrl: "",
  apiKey: "",
  attribution: "",
};

/**
 * Platform map control plane. Stores the tile style URL + restricted client key
 * server-side so the web and mobile maps read a resolved style URL from the API
 * instead of bundling a key.
 */
export function MapsSettingsPanel() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [hasKey, setHasKey] = useState(false);
  const [encryptionConfigured, setEncryptionConfigured] = useState(true);
  const [updated, setUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const detectedProvider = providerFromStyleUrl(form.styleUrl);
  const providerMismatch =
    detectedProvider !== null && detectedProvider !== form.provider;

  const apply = useCallback(
    (record: Awaited<ReturnType<typeof fetchPlatformMapSettings>>) => {
      setForm({
        enabled: record.enabled,
        provider: record.provider,
        styleUrl: record.styleUrl ?? "",
        apiKey: "",
        attribution: record.attribution ?? "",
      });
      setHasKey(record.hasApiKey);
      setEncryptionConfigured(record.encryptionConfigured);
      setUpdated(record.updatedAt);
    },
    [],
  );

  const load = useCallback(async () => {
    try {
      apply(await fetchPlatformMapSettings());
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [apply]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const record = await fetchPlatformMapSettings();
        if (active) apply(record);
      } catch (err) {
        toast.error(getDisplayErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [apply]);

  const save = async (extra: { clearApiKey?: boolean } = {}) => {
    setBusy(true);
    try {
      const record = await updatePlatformMapSettings({
        enabled: form.enabled,
        provider: form.provider,
        styleUrl: form.styleUrl.trim(),
        attribution: form.attribution.trim(),
        ...(form.apiKey.trim() ? { apiKey: form.apiKey.trim() } : {}),
        ...extra,
      });
      apply(record);
      setForm((prev) => ({ ...prev, apiKey: "" }));
      toast.success("Map settings saved");
      await load();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Tile provider
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            The style URL is served to authenticated clients; the key is never
            bundled into the apps.
          </p>
        </div>
        <Badge variant={form.enabled ? "default" : "secondary"}>
          {form.enabled ? "Live" : "Off"}
        </Badge>
      </div>

      <div className="mt-5 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <Label>Enable live maps</Label>
            <p className="text-xs text-slate-400">
              When off, apps fall back to a tile-less map.
            </p>
          </div>
          <Switch
            checked={form.enabled}
            onCheckedChange={(checked) =>
              setForm((prev) => ({ ...prev, enabled: checked }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Provider</Label>
          <Select
            value={form.provider}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, provider: value as MapProviderKind }))
            }
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((provider) => (
                <SelectItem key={provider.value} value={provider.value}>
                  {provider.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Style URL</Label>
          <Input
            value={form.styleUrl}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, styleUrl: event.target.value }))
            }
            placeholder={EXAMPLE_STYLE}
            className="rounded-xl"
          />
          <p className="text-xs text-slate-400">
            Use <code>{"{key}"}</code> where the API key belongs.
          </p>
          {detectedProvider ? (
            <p className="text-xs text-slate-400">
              Maps and geocoding use{" "}
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {providerLabel(detectedProvider)}
              </span>
              , implied by this style URL.
              {providerMismatch ? (
                <span className="text-amber-600 dark:text-amber-400">
                  {" "}
                  The Provider field says {providerLabel(form.provider)}, but the
                  style URL implies {providerLabel(detectedProvider)} — the URL
                  wins for tiles and geocoding. Set Provider to{" "}
                  {providerLabel(detectedProvider)} to keep them in sync.
                </span>
              ) : null}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>API key</Label>
          <Input
            type="password"
            value={form.apiKey}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, apiKey: event.target.value }))
            }
            placeholder={
              hasKey ? "•••••• stored — leave blank to keep" : "Restricted client key"
            }
            className="rounded-xl"
          />
          <p className="text-xs text-slate-400">
            Use a referrer/domain-locked key — it reaches authenticated clients by
            design. {hasKey ? "A key is currently stored." : "No key stored yet."}
          </p>
          {!encryptionConfigured ? (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Set APP_PAYMENTS_ENCRYPTION_KEY on the API before saving a key — it is
              stored encrypted at rest.
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Attribution</Label>
          <Input
            value={form.attribution}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, attribution: event.target.value }))
            }
            placeholder="© OpenStreetMap contributors"
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {updated ? `Updated ${new Date(updated).toLocaleString()}` : ""}
        </span>
        <div className="flex gap-2">
          {hasKey ? (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void save({ clearApiKey: true })}
            >
              Clear key
            </Button>
          ) : null}
          <Button disabled={busy || loading} onClick={() => void save()}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
