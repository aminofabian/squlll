"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Copy,
  KeyRound,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  Send,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getTenantInfo } from "@/lib/utils";
import {
  sendLoginDetails,
  type ContactKind,
  type CredentialChannel,
} from "@/lib/school/credentialsApi";
import { schoolPortalUrl } from "@/lib/auth/post-login-navigation";

export interface ContactablePerson {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  /** Known default password, e.g. a student's admission number. */
  defaultPassword?: string | null;
}

interface ContactActionsMenuProps {
  kind: ContactKind;
  person: ContactablePerson;
  schoolName?: string;
  subdomain?: string;
  /** Whether the person can receive portal login details. */
  canSendLogin?: boolean;
  disabled?: boolean;
  align?: "start" | "end";
  className?: string;
  /** Show the "Contact" text next to the icon. */
  showLabel?: boolean;
}

const PORTAL_PATH: Record<ContactKind, string> = {
  teacher: "/login",
  staff: "/login",
  parent: "/login",
  student: "/student",
};

const CHANNEL_LABEL: Record<CredentialChannel, string> = {
  SMS: "SMS",
  WHATSAPP: "WhatsApp",
  EMAIL: "email",
};

/** Convert a Kenyan phone number to the international form wa.me expects. */
export function toWhatsAppNumber(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("254")) return digits;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

export function ContactActionsMenu({
  kind,
  person,
  schoolName,
  subdomain,
  canSendLogin = true,
  disabled = false,
  align = "end",
  className,
  showLabel = false,
}: ContactActionsMenuProps) {
  const [sending, setSending] = useState<CredentialChannel | null>(null);

  // Resolve school context from the route/cookies so directory tables do not
  // have to thread it through every row.
  const params = useParams<{ subdomain?: string }>();
  const routeSubdomain =
    typeof params?.subdomain === "string" ? params.subdomain : undefined;
  const resolvedSubdomain = subdomain ?? routeSubdomain;

  const email = person.email?.trim() || null;
  const phone = person.phone?.trim() || null;
  const waNumber = useMemo(() => toWhatsAppNumber(phone), [phone]);

  const loginUrl = useMemo(() => {
    if (!resolvedSubdomain) return null;
    return schoolPortalUrl(resolvedSubdomain, PORTAL_PATH[kind]);
  }, [resolvedSubdomain, kind]);

  const resetUrl = useMemo(() => {
    if (!resolvedSubdomain) return null;
    return schoolPortalUrl(resolvedSubdomain, "/forgot-password");
  }, [resolvedSubdomain]);

  /** Built on demand so cookie reads never run during render/hydration. */
  const buildMessage = () => {
    const schoolLabel =
      schoolName ?? getTenantInfo()?.tenantName ?? "your school";
    const firstName = person.name?.split(" ")[0] || person.name || "there";
    const passwordLine = person.defaultPassword
      ? `Password: ${person.defaultPassword}`
      : kind === "student"
        ? null
        : resetUrl
          ? `Set or reset your password here: ${resetUrl}`
          : null;
    const lines = [
      `Hi ${firstName},`,
      `Here are your ${schoolLabel} login details.`,
      email ? `Login: ${email}` : null,
      passwordLine,
      loginUrl ? `Sign in: ${loginUrl}` : null,
    ];
    return lines.filter(Boolean).join("\n");
  };

  const send = async (channel: CredentialChannel) => {
    if (sending) return;
    if (channel === "EMAIL" && !email) {
      toast.error(`No email address on file for ${person.name}.`);
      return;
    }
    if ((channel === "SMS" || channel === "WHATSAPP") && !phone) {
      toast.error(`No phone number on file for ${person.name}.`);
      return;
    }
    setSending(channel);
    try {
      await sendLoginDetails(kind, person.id, channel);
      toast.success(`Login details sent via ${CHANNEL_LABEL[channel]}`, {
        description: `${person.name} will receive their sign-in details${
          channel === "EMAIL" ? ` at ${email}` : ` on ${phone}`
        }.`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send login details",
      );
    } finally {
      setSending(null);
    }
  };

  const openWhatsApp = () => {
    if (!waNumber) {
      toast.error(`No phone number on file for ${person.name}.`);
      return;
    }
    window.open(
      `https://wa.me/${waNumber}?text=${encodeURIComponent(buildMessage())}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const openSms = () => {
    if (!phone) {
      toast.error(`No phone number on file for ${person.name}.`);
      return;
    }
    const digits = phone.replace(/\D/g, "");
    window.location.href = `sms:${digits}?body=${encodeURIComponent(buildMessage())}`;
  };

  const openEmail = () => {
    if (!email) {
      toast.error(`No email address on file for ${person.name}.`);
      return;
    }
    const subject = `${getTenantInfo()?.tenantName ?? schoolName ?? "Your school"}: your login details`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(buildMessage())}`;
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(buildMessage());
      toast.success("Message copied — paste it into any app.");
    } catch {
      toast.error("Could not copy the message.");
    }
  };

  return (
    <span
      className="inline-flex"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant={showLabel ? "outline" : "ghost"}
            size="sm"
            disabled={disabled}
            aria-label={`Contact ${person.name}`}
            title={`Contact ${person.name}`}
            className={cn(
              showLabel ? "h-8 gap-1.5 text-xs" : "h-7 w-7 rounded-md p-0",
              className,
            )}
          >
            {sending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <MessageSquare className="h-3.5 w-3.5" />
            )}
            {showLabel ? (
              <span className="hidden sm:inline">Contact</span>
            ) : null}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className="w-64 rounded-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenuLabel className="pb-1">
            <span className="block truncate text-xs font-semibold">
              {person.name}
            </span>
            <span className="mt-0.5 block truncate text-[10px] font-normal text-muted-foreground">
              {email || "No email"} · {phone || "No phone"}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuLabel className="flex items-center gap-1.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <KeyRound className="h-3 w-3" />
            Send login details
          </DropdownMenuLabel>
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-xs"
            disabled={!canSendLogin || !phone || sending !== null}
            onClick={() => void send("WHATSAPP")}
          >
            {sending === "WHATSAPP" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <MessageCircle className="h-3.5 w-3.5" />
            )}
            WhatsApp
            {!phone ? (
              <span className="ml-auto text-[10px] text-muted-foreground">
                no phone
              </span>
            ) : null}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-xs"
            disabled={!canSendLogin || !phone || sending !== null}
            onClick={() => void send("SMS")}
          >
            {sending === "SMS" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Smartphone className="h-3.5 w-3.5" />
            )}
            Text message (SMS)
            {!phone ? (
              <span className="ml-auto text-[10px] text-muted-foreground">
                no phone
              </span>
            ) : null}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-xs"
            disabled={!canSendLogin || !email || sending !== null}
            onClick={() => void send("EMAIL")}
          >
            {sending === "EMAIL" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Mail className="h-3.5 w-3.5" />
            )}
            Email
            {!email ? (
              <span className="ml-auto text-[10px] text-muted-foreground">
                no email
              </span>
            ) : null}
          </DropdownMenuItem>
          {!canSendLogin ? (
            <p className="px-2 py-1 text-[10px] leading-relaxed text-muted-foreground">
              No portal account yet — activate or invite them first.
            </p>
          ) : null}

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center gap-1.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Send className="h-3 w-3" />
            Message from this device
          </DropdownMenuLabel>
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-xs"
            disabled={!waNumber}
            onClick={openWhatsApp}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Open WhatsApp chat
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-xs"
            disabled={!phone}
            onClick={openSms}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Open SMS app
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-xs"
            disabled={!email}
            onClick={openEmail}
          >
            <Mail className="h-3.5 w-3.5" />
            Open email app
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-xs"
            onClick={() => void copyMessage()}
          >
            <Copy className="h-3.5 w-3.5" />
            Copy login message
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}
