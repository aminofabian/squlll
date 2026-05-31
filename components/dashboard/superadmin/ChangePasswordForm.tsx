"use client";

import { useState } from "react";
import {
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Save,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ChangePasswordFormProps {
  saving?: boolean;
  onSubmit: (input: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<string>;
}

export function ChangePasswordForm({
  saving,
  onSubmit,
}: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    {},
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const toggleVisibility = (field: string) => {
    setVisibleFields((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters",
      });
      return;
    }

    try {
      const successMessage = await onSubmit({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setMessage({ type: "success", text: successMessage });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Failed to change password",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        {
          id: "current",
          label: "Current password",
          value: currentPassword,
          onChange: setCurrentPassword,
          placeholder: "Enter current password",
        },
        {
          id: "new",
          label: "New password",
          value: newPassword,
          onChange: setNewPassword,
          placeholder: "At least 8 characters with mixed case, numbers, and symbols",
        },
        {
          id: "confirm",
          label: "Confirm new password",
          value: confirmPassword,
          onChange: setConfirmPassword,
          placeholder: "Re-enter new password",
        },
      ].map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={`password-${field.id}`}>{field.label}</Label>
          <div className="relative">
            <Input
              id={`password-${field.id}`}
              type={visibleFields[field.id] ? "text" : "password"}
              placeholder={field.placeholder}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              required
              minLength={field.id === "new" ? 8 : undefined}
              className="rounded-xl border-slate-200/60 pr-10 dark:border-slate-700/60"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => toggleVisibility(field.id)}
            >
              {visibleFields[field.id] ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      ))}

      {message ? (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border p-3 text-sm",
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800/40 dark:bg-green-950 dark:text-green-300"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-800/40 dark:bg-red-950 dark:text-red-300",
          )}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {message.text}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating password...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Update password
          </>
        )}
      </Button>
    </form>
  );
}
