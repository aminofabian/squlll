import { isBankAccountReady } from '../bankAccounts'
import { formatBankPaybillLine } from '../kenyaBanks'
import type { BankAccount } from '../../types'
import type { FeeLetterPaymentChannel } from './types'

const PLACEHOLDER = /^[.\s…·-]+$/

function clean(value?: string | null): string {
  const text = (value ?? '').trim()
  if (!text || PLACEHOLDER.test(text)) return ''
  return text
}

/** Channels that actually exist — nothing is invented for the letter. */
export function buildPaymentChannels(input: {
  bankAccounts?: BankAccount[]
  postalAddress?: string
  includePostalMoneyOrder?: boolean
  mpesaCustodyLine?: string | null
}): FeeLetterPaymentChannel[] {
  const channels: FeeLetterPaymentChannel[] = []

  ;(input.bankAccounts ?? []).forEach((account, index) => {
    if (!isBankAccountReady(account)) return
    const bankName = clean(account.bankName)
    const accountNumber = clean(account.accountNumber)
    if (!bankName || !accountNumber) return
    const paybill = formatBankPaybillLine(clean(account.branch))
    channels.push({
      id: `bank-${index}`,
      kind: 'bank',
      label: 'Bank',
      title: bankName,
      lines: [paybill, `Account ${accountNumber}`].filter(Boolean),
    })
  })

  const mpesa = clean(input.mpesaCustodyLine)
  if (mpesa) {
    channels.push({
      id: 'mpesa',
      kind: 'mpesa',
      label: 'M-Pesa',
      title: mpesa,
      lines: [],
    })
  }

  const postal = input.includePostalMoneyOrder
    ? clean(input.postalAddress)
    : ''
  if (postal) {
    channels.push({
      id: 'postal',
      kind: 'postal',
      label: 'Post',
      title: 'Postal money order',
      lines: [postal],
    })
  }

  return channels
}

export function paymentIntro(channels: FeeLetterPaymentChannel[]): string {
  if (channels.length === 0) return ''
  const kinds = new Set(channels.map((channel) => channel.kind))
  if (kinds.size === 1 && kinds.has('mpesa')) {
    return 'Fees are paid in full at the start of each term on the phone, using the M-Pesa details below.'
  }
  if (kinds.size === 1 && kinds.has('bank')) {
    return channels.length > 1
      ? 'Fees are paid in full at the start of each term into any school account below. Keep the pay-in slip for your receipt.'
      : 'Fees are paid in full at the start of each term into the school account below. Keep the pay-in slip for your receipt.'
  }
  if (kinds.size === 1 && kinds.has('postal')) {
    return 'Fees may be sent by postal money order, payable as shown below.'
  }
  return 'Fees are paid in full at the start of each term. Use any method below, and keep the confirmation for your receipt.'
}

export function feeLetterHasPaymentCopy(input: {
  paymentChannels: FeeLetterPaymentChannel[]
  paymentNotes: string[]
}): boolean {
  return input.paymentChannels.length > 0 || input.paymentNotes.length > 0
}
