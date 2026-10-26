import type { BankAccount } from '../types'

/** Trim and drop rows the owner never touched. */
export function cleanBankAccounts(accounts: BankAccount[]): BankAccount[] {
  return accounts
    .map((account) => ({
      bankName: (account.bankName ?? '').trim(),
      branch: (account.branch ?? '').trim(),
      accountNumber: (account.accountNumber ?? '').trim(),
    }))
    .filter((account) => account.bankName || account.branch || account.accountNumber)
}

/** A bank account is usable on a fee letter once it has a bank and an account number. */
export function isBankAccountReady(account: BankAccount): boolean {
  return Boolean((account.bankName ?? '').trim() && (account.accountNumber ?? '').trim())
}

export function blankBankAccount(): BankAccount {
  return { bankName: '', branch: '', accountNumber: '' }
}
