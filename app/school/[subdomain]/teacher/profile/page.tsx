'use client';

import React, { useMemo, useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle2, Loader2, Mail, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTeacherData } from '@/lib/hooks/useTeacherData';

function Initials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return (
    <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
      {initials || '?'}
    </span>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </header>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

export default function TeacherProfilePage() {
  const { teacher, loading, error, getFormattedSubjects, getFormattedGradeLevels } =
    useTeacherData();

  const subjects = useMemo(
    () => getFormattedSubjects(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [teacher],
  );
  const grades = useMemo(
    () => getFormattedGradeLevels(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [teacher],
  );
  const classAssignments = useMemo(
    () => (teacher?.classTeacherAssignments ?? []).filter((item) => item.active),
    [teacher],
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSaved(false);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Fill in all three fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || 'Could not change password');
      }
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : 'Could not change password',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <AlertCircle className="mx-auto size-5 text-rose-500" />
          <h1 className="mt-2 text-base font-semibold">Profile unavailable</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {error ?? 'Your teacher profile could not be loaded.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-5 lg:px-0 lg:py-0">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Profile
        </p>
        <h1 className="mt-0.5 text-xl font-semibold tracking-tight">
          {teacher.fullName}
        </h1>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <Initials name={teacher.fullName} />
        <div className="min-w-0">
          <p className="text-base font-semibold">{teacher.fullName}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="size-3.5" />
            {teacher.email}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ask your school administrator to change your name, email or class
            assignments.
          </p>
        </div>
      </section>

      <Card
        title="Teaching assignments"
        description="Classes and learning areas your school has assigned to you."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <BookOpen className="size-3.5" />
              Learning areas
            </p>
            {subjects.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">None assigned</p>
            ) : (
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {subjects.map((subject) => (
                  <li
                    key={subject.id}
                    className="rounded-full border border-border px-2.5 py-0.5 text-xs"
                  >
                    {subject.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Users className="size-3.5" />
              Classes
            </p>
            {grades.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">None assigned</p>
            ) : (
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {grades.map((grade) => (
                  <li
                    key={grade.id}
                    className="rounded-full border border-border px-2.5 py-0.5 text-xs"
                  >
                    {grade.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {classAssignments.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Class teacher
            </p>
            <ul className="mt-1.5 space-y-1 text-sm">
              {classAssignments.map((assignment) => (
                <li key={assignment.id}>
                  {assignment.gradeLevel?.gradeLevel?.name ?? 'Class'}
                  {assignment.stream?.stream?.name
                    ? ` ${assignment.stream.stream.name}`
                    : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card
        title="Password"
        description="Use at least 8 characters. You will stay signed in on this device."
      >
        <form className="space-y-3" onSubmit={handleChangePassword}>
          <div className="space-y-1.5">
            <Label htmlFor="current" className="text-xs">
              Current password
            </Label>
            <Input
              id="current"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="new" className="text-xs">
                New password
              </Label>
              <Input
                id="new"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-xs">
                Confirm new password
              </Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
          </div>

          {passwordError && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              {passwordError}
            </p>
          )}
          {passwordSaved && (
            <p className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="size-4" />
              Password changed.
            </p>
          )}

          <Button type="submit" size="sm" disabled={saving}>
            {saving && <Loader2 className="mr-2 size-3.5 animate-spin" />}
            Change password
          </Button>
        </form>
      </Card>
    </div>
  );
}
