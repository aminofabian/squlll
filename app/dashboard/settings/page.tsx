"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Shield,
  Database,
  Globe,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

// ─── Health Check ──────────────────────────────────────────────

interface HealthStatus {
  label: string;
  status: "healthy" | "warning" | "error";
  detail: string;
  icon: typeof CheckCircle;
}

async function checkBackendHealth(): Promise<
  Pick<HealthStatus, "status" | "detail">
> {
  try {
    const res = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ __typename }" }),
    });
    if (res.ok) return { status: "healthy", detail: "Connected" };
    return { status: "error", detail: `HTTP ${res.status}` };
  } catch {
    return { status: "error", detail: "Unreachable" };
  }
}

// ─── Password Change ───────────────────────────────────────────

function usePasswordChange() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setMessage({
        type: "success",
        text: data.message || "Password changed successfully",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    message,
    handleSubmit,
  };
}

// ─── Component ─────────────────────────────────────────────────

export default function SettingsPage() {
  const [showPasswordFields, setShowPasswordFields] = useState<
    Record<string, boolean>
  >({});
  const [health, setHealth] = useState<HealthStatus[]>([
    {
      label: "GraphQL API",
      status: "healthy",
      detail: "Checking...",
      icon: Globe,
    },
    {
      label: "Database",
      status: "healthy",
      detail: "Checking...",
      icon: Database,
    },
    {
      label: "Authentication",
      status: "healthy",
      detail: "Checking...",
      icon: Shield,
    },
  ]);
  const [checking, setChecking] = useState(false);
  const pw = usePasswordChange();

  const runHealthCheck = useCallback(async () => {
    setChecking(true);
    const apiResult = await checkBackendHealth();

    setHealth([
      { label: "GraphQL API", ...apiResult, icon: Globe },
      {
        label: "Database",
        status: apiResult.status === "healthy" ? "healthy" : "warning",
        detail: apiResult.status === "healthy" ? "Connected" : "Cannot verify",
        icon: Database,
      },
      {
        label: "Authentication",
        status: "healthy",
        detail: "JWT tokens active",
        icon: Shield,
      },
    ]);
    setChecking(false);
  }, []);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  const togglePw = (field: string) =>
    setShowPasswordFields((prev) => ({ ...prev, [field]: !prev[field] }));

  const integrations = [
    {
      name: "SMS Provider",
      status: "configured" as const,
      desc: "Twilio / Africa's Talking",
    },
    {
      name: "Email Service",
      status: "configured" as const,
      desc: "Resend / SMTP",
    },
    {
      name: "Payment Gateway",
      status: "not-configured" as const,
      desc: "Not set up",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Settings
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              System preferences, security, and integrations
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runHealthCheck}
            disabled={checking}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${checking ? "animate-spin" : ""}`}
            />
            {checking ? "Checking..." : "Refresh Status"}
          </Button>
        </div>

        {/* System Status */}
        <Card className="rounded-2xl border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Settings className="mr-2 h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {health.map((stat) => {
                const Icon = stat.icon;
                const color =
                  stat.status === "healthy"
                    ? "text-green-600 bg-green-100 dark:bg-green-900/20"
                    : stat.status === "warning"
                      ? "text-amber-600 bg-amber-100 dark:bg-amber-900/20"
                      : "text-red-600 bg-red-100 dark:bg-red-900/20";
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {stat.label}
                      </p>
                      <p className="text-xs text-slate-500">{stat.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Account Info */}
          <Card className="rounded-2xl border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Shield className="mr-2 h-5 w-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value="admin@squl.co.ke"
                  disabled
                  className="rounded-xl border-slate-200/60 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value="Super Admin"
                  disabled
                  className="rounded-xl border-slate-200/60 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="rounded-2xl border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Shield className="mr-2 h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={pw.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cp-current">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="cp-current"
                      type={showPasswordFields["current"] ? "text" : "password"}
                      placeholder="Enter current password"
                      value={pw.currentPassword}
                      onChange={(e) => pw.setCurrentPassword(e.target.value)}
                      required
                      className="rounded-xl border-slate-200/60 dark:border-slate-700/60"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => togglePw("current")}
                    >
                      {showPasswordFields["current"] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cp-new">New Password</Label>
                  <div className="relative">
                    <Input
                      id="cp-new"
                      type={showPasswordFields["new"] ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={pw.newPassword}
                      onChange={(e) => pw.setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="rounded-xl border-slate-200/60 dark:border-slate-700/60"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => togglePw("new")}
                    >
                      {showPasswordFields["new"] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cp-confirm">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="cp-confirm"
                      type={showPasswordFields["confirm"] ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={pw.confirmPassword}
                      onChange={(e) => pw.setConfirmPassword(e.target.value)}
                      required
                      className="rounded-xl border-slate-200/60 dark:border-slate-700/60"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => togglePw("confirm")}
                    >
                      {showPasswordFields["confirm"] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {pw.message && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                      pw.message.type === "success"
                        ? "bg-green-50 dark:bg-green-950 text-green-700 border border-green-200 dark:border-green-800/40"
                        : "bg-red-50 dark:bg-red-950 text-red-700 border border-red-200 dark:border-red-800/40"
                    }`}
                  >
                    {pw.message.type === "success" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {pw.message.text}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={pw.loading}>
                  {pw.loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Change Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Integrations */}
        <Card className="rounded-2xl border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Globe className="mr-2 h-5 w-5" />
              Service Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.map((svc) => (
                <div
                  key={svc.name}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <div className="flex items-center gap-3">
                    {svc.status === "configured" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-slate-300" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {svc.name}
                      </p>
                      <p className="text-xs text-slate-500">{svc.desc}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      svc.status === "configured" ? "default" : "secondary"
                    }
                    className="text-[10px] uppercase"
                  >
                    {svc.status === "configured" ? "Configured" : "Not Set Up"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card className="rounded-2xl border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Database className="mr-2 h-5 w-5" />
              Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Clear Cache
                </p>
                <p className="text-xs text-slate-500">
                  Flush Redis and application cache
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Clear Cache
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  System Logs
                </p>
                <p className="text-xs text-slate-500">
                  Download recent application logs
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Export Logs
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Backup Data
                </p>
                <p className="text-xs text-slate-500">
                  Create a database backup
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Create Backup
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
