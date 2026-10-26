import { describe, expect, it } from 'vitest'
import {
  KENYA_BANKS,
  bankMonogram,
  bankPaybillLabel,
  bankShortName,
  findKenyaBankByName,
  popularKenyaBanks,
  searchKenyaBanks,
} from './kenyaBanks'

describe('kenya bank picker', () => {
  it('puts the banks schools ask for first', () => {
    expect(popularKenyaBanks().map((bank) => bank.id).slice(0, 3)).toEqual([
      'equity',
      'kcb',
      'coop',
    ])
    expect(bankShortName(popularKenyaBanks()[0])).toBe('Equity')
  })

  it('finds a bank from its everyday name or paybill', () => {
    expect(searchKenyaBanks('kcb')[0]?.id).toBe('kcb')
    expect(searchKenyaBanks('522522')[0]?.id).toBe('kcb')
    expect(findKenyaBankByName('Equity Bank')?.businessNumber).toBe('247247')
  })

  it('gives every bank a short mark and a paybill label', () => {
    const equity = findKenyaBankByName('Equity Bank')
    const kcb = findKenyaBankByName('KCB')
    const coop = findKenyaBankByName('Cooperative Bank')

    expect(equity && bankMonogram(equity)).toBe('EQ')
    expect(kcb && bankMonogram(kcb)).toBe('KCB')
    expect(coop && bankMonogram(coop)).toBe('CO-OP')
    expect(KENYA_BANKS.every((bank) => bankMonogram(bank).length >= 2)).toBe(true)

    expect(equity && bankPaybillLabel(equity)).toBe('Paybill 247247')
    const noPaybill = KENYA_BANKS.find((bank) => !bank.businessNumber)
    expect(noPaybill && bankPaybillLabel(noPaybill)).toBe('Paybill on slip')
  })
})
