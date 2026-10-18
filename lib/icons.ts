import {
  AlertCircle,
  Bell,
  Bus,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  CreditCard,
  File,
  FileText,
  MessageSquare,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Web mirror of the mobile `ICONS` map. Product chrome (nav, cards, empty
 * states) uses these; marketing illustrations may still pick a one-off glyph.
 */
export const ICONS = {
  fees: Wallet,
  students: Users,
  attendance: CheckSquare,
  timetable: CalendarDays,
  messages: MessageSquare,
  reports: FileText,
  notes: File,
  notifications: Bell,
  transport: Bus,
  payments: CreditCard,
  success: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
} as const satisfies Record<string, LucideIcon>;
