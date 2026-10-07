"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type FormState = {
  name: string
  email: string
  schoolName: string
  phone: string
  role: string
  county: string
  studentCount: string
  preferredTime: string
  message: string
}

const EMPTY: FormState = {
  name: "",
  email: "",
  schoolName: "",
  phone: "",
  role: "",
  county: "",
  studentCount: "",
  preferredTime: "",
  message: "",
}

const ROLE_OPTIONS = [
  "School owner / Director",
  "Head teacher / Principal",
  "Deputy / Director of Studies",
  "Bursar / Finance",
  "ICT / Administrator",
  "Other",
]

const STUDENT_COUNT_OPTIONS = [
  "Under 200",
  "200 – 500",
  "500 – 1,000",
  "1,000 – 2,000",
  "Over 2,000",
]

const TIME_OPTIONS = ["Weekday mornings", "Weekday afternoons", "Saturday", "Any time"]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const COPY = {
  walkthrough: {
    title: "Book a walkthrough",
    description:
      "Tell us a little about your school and we\u2019ll set up a live walkthrough of SQUL \u2014 no obligation.",
    submit: "Request a walkthrough",
  },
  demo: {
    title: "See SQUL in action",
    description:
      "Tell us about your school and we\u2019ll give you a live, guided demo \u2014 no obligation.",
    submit: "Book a live demo",
  },
} as const

export type WalkthroughDialogVariant = keyof typeof COPY

const selectClass =
  "flex h-9 w-full min-w-0 border border-black bg-white px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-black"

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-slate-700">
        {label}
      </Label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

export function WalkthroughDialog({
  open,
  onOpenChange,
  variant = "walkthrough",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant?: WalkthroughDialogVariant
}) {
  const copy = COPY[variant]
  const [form, setForm] = useState<FormState>(EMPTY)
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({})
  const [successMessage, setSuccessMessage] = useState("")

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function reset() {
    setForm(EMPTY)
    setStatus("idle")
    setError(null)
    setFieldErrors({})
    setSuccessMessage("")
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    // Keep a half-typed form if the visitor closes by mistake, but don't let a
    // completed submission linger the next time the dialog opens.
    if (!next && status === "sent") reset()
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const nextErrors: Partial<Record<keyof FormState, string>> = {}
    if (form.name.trim().length < 2) nextErrors.name = "Please enter your name."
    if (!EMAIL_RE.test(form.email.trim()))
      nextErrors.email = "Enter a valid email address."
    if (form.schoolName.trim().length < 2)
      nextErrors.schoolName = "Please enter your school name."

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus("sending")
    setError(null)

    try {
      const response = await fetch("/api/walkthrough", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok || !payload?.ok) {
        setStatus("error")
        setError(
          payload?.error ||
            payload?.message ||
            "Something went wrong. Please try again.",
        )
        return
      }

      setSuccessMessage(
        payload.message || "Thanks — we'll reach out shortly.",
      )
      setStatus("sent")
    } catch {
      setStatus("error")
      setError(
        "Could not reach the server. Please check your connection and try again.",
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {status === "sent" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-11 w-11 text-emerald-600" aria-hidden />
            <DialogHeader className="items-center gap-1.5 text-center sm:text-center">
              <DialogTitle>Request received</DialogTitle>
              <DialogDescription>{successMessage}</DialogDescription>
            </DialogHeader>
            <Button
              type="button"
              className="mt-2 rounded-lg bg-emerald-600 px-6 font-semibold text-white hover:bg-emerald-500"
              onClick={() => handleOpenChange(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{copy.title}</DialogTitle>
              <DialogDescription>{copy.description}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" htmlFor="wt-name" error={fieldErrors.name}>
                  <Input
                    id="wt-name"
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Jane Wanjiku"
                  />
                </Field>

                <Field
                  label="Work email"
                  htmlFor="wt-email"
                  error={fieldErrors.email}
                >
                  <Input
                    id="wt-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@school.ac.ke"
                  />
                </Field>

                <Field
                  label="School name"
                  htmlFor="wt-school"
                  error={fieldErrors.schoolName}
                >
                  <Input
                    id="wt-school"
                    name="schoolName"
                    autoComplete="organization"
                    value={form.schoolName}
                    onChange={(e) => set("schoolName", e.target.value)}
                    placeholder="Sunrise Academy"
                  />
                </Field>

                <Field label="Phone (optional)" htmlFor="wt-phone">
                  <Input
                    id="wt-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+254 700 000 000"
                  />
                </Field>

                <Field label="Your role" htmlFor="wt-role">
                  <select
                    id="wt-role"
                    name="role"
                    className={selectClass}
                    value={form.role}
                    onChange={(e) => set("role", e.target.value)}
                  >
                    <option value="">Select…</option>
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="County / town" htmlFor="wt-county">
                  <Input
                    id="wt-county"
                    name="county"
                    value={form.county}
                    onChange={(e) => set("county", e.target.value)}
                    placeholder="Nairobi"
                  />
                </Field>

                <Field label="Number of students" htmlFor="wt-students">
                  <select
                    id="wt-students"
                    name="studentCount"
                    className={selectClass}
                    value={form.studentCount}
                    onChange={(e) => set("studentCount", e.target.value)}
                  >
                    <option value="">Select…</option>
                    {STUDENT_COUNT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Preferred time" htmlFor="wt-time">
                  <select
                    id="wt-time"
                    name="preferredTime"
                    className={selectClass}
                    value={form.preferredTime}
                    onChange={(e) => set("preferredTime", e.target.value)}
                  >
                    <option value="">Select…</option>
                    {TIME_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Anything else? (optional)" htmlFor="wt-message">
                <Textarea
                  id="wt-message"
                  name="message"
                  rows={3}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="Which modules matter most — fees, exams, timetabling…?"
                />
              </Field>

              {error ? (
                <p
                  role="alert"
                  className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={status === "sending"}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={status === "sending"}
                  className="rounded-lg bg-emerald-600 font-semibold text-white hover:bg-emerald-500"
                >
                  {status === "sending" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {status === "sending" ? "Sending…" : copy.submit}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
