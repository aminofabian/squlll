import { DEFAULT_SCHOOL_MOTTO } from '@/lib/schoolLogo'
import {
  createDefaultPaymentModes,
  createDefaultSchoolDetails,
} from '../feesDocumentDefaults'
import type { BankAccount } from '../../types'

export type LetterSchoolDetailsPayload = {
  schoolDetails: {
    name: string
    address: string
    contact: string
    email: string
    principalName: string
    principalTitle: string
  }
  paymentModes: {
    bankAccounts: BankAccount[]
    postalAddress: string
    includePostalMoneyOrder?: boolean
    notes: string[]
  }
  logoUrl: string | null
  schoolMotto: string
}

const STORAGE_PREFIX = 'squl:fee-letter-details:'

export function letterSchoolDetailsStorageKey(scope: string): string {
  return `${STORAGE_PREFIX}${scope}`
}

export function createDefaultLetterSchoolDetails(
  subdomain: string,
): LetterSchoolDetailsPayload {
  return {
    schoolDetails: createDefaultSchoolDetails(subdomain),
    paymentModes: createDefaultPaymentModes(),
    logoUrl: null,
    schoolMotto: DEFAULT_SCHOOL_MOTTO,
  }
}

export function readLetterSchoolDetails(
  scope: string,
): LetterSchoolDetailsPayload | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(letterSchoolDetailsStorageKey(scope))
    if (!raw) return null
    return JSON.parse(raw) as LetterSchoolDetailsPayload
  } catch {
    return null
  }
}

export function writeLetterSchoolDetails(
  scope: string,
  details: LetterSchoolDetailsPayload,
): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      letterSchoolDetailsStorageKey(scope),
      JSON.stringify(details),
    )
  } catch {
    /* quota */
  }
}

export function summarizeLetterDetails(d: LetterSchoolDetailsPayload): string {
  const parts = [
    d.schoolDetails.principalName || 'Signatory not set',
    d.schoolDetails.address,
    d.paymentModes.bankAccounts.length
      ? `${d.paymentModes.bankAccounts.length} bank account(s)`
      : null,
  ].filter(Boolean)
  return parts.join(' · ')
}
