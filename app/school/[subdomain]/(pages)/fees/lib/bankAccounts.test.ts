import { describe, expect, it } from 'vitest'
import {
  blankBankAccount,
  cleanBankAccounts,
  isBankAccountReady,
} from './bankAccounts'

describe('bank account helpers', () => {
  it('trims what the owner typed and drops untouched rows', () => {
    expect(
      cleanBankAccounts([
        { bankName: ' Equity Bank ', branch: ' 247247 ', accountNumber: ' 0110 ' },
        blankBankAccount(),
      ]),
    ).toEqual([
      { bankName: 'Equity Bank', branch: '247247', accountNumber: '0110' },
    ])
  })

  it('only treats an account as ready once the account number is set', () => {
    expect(
      isBankAccountReady({
        bankName: 'Cooperative Bank of Kenya Limited',
        branch: '400200',
        accountNumber: '0110398765',
      }),
    ).toBe(true)
    expect(
      isBankAccountReady({
        bankName: 'Cooperative Bank of Kenya Limited',
        branch: '400200',
        accountNumber: '',
      }),
    ).toBe(false)
    expect(isBankAccountReady(blankBankAccount())).toBe(false)
  })
})
