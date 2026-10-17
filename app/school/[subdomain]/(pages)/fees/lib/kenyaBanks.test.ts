import { describe, expect, it } from 'vitest'
import {
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
})
