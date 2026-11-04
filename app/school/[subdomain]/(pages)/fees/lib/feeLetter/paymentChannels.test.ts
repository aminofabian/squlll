import { describe, expect, it } from 'vitest'
import { buildPaymentChannels, paymentIntro } from './paymentChannels'

describe('buildPaymentChannels', () => {
  it('ignores blank banks and only lists methods that were filled in', () => {
    const channels = buildPaymentChannels({
      bankAccounts: [
        { bankName: 'Kenya Commercial Bank', branch: '', accountNumber: '' },
        {
          bankName: 'Equity Bank',
          branch: '247247',
          accountNumber: '011234',
        },
      ],
      mpesaCustodyLine: 'Buy Goods till 3502582',
      includePostalMoneyOrder: true,
      postalAddress: 'Nyahururu Post Office',
    })

    expect(channels.map((channel) => channel.kind)).toEqual([
      'bank',
      'mpesa',
      'postal',
    ])
    expect(channels[0]).toMatchObject({
      title: 'Equity Bank',
      lines: ['Paybill 247247', 'Account 011234'],
    })
    expect(channels[1].title).toBe('Buy Goods till 3502582')
    expect(paymentIntro(channels)).toMatch(/any method/i)
  })

  it('writes a phone-only line when M-Pesa is the only method', () => {
    const channels = buildPaymentChannels({
      bankAccounts: [],
      mpesaCustodyLine: 'Paybill 880100 · Acc 0140',
    })
    expect(paymentIntro(channels)).toMatch(/M-Pesa/)
    expect(channels).toHaveLength(1)
  })

  it('returns nothing when no method has been added', () => {
    expect(
      buildPaymentChannels({
        bankAccounts: [
          { bankName: 'Co-operative Bank of Kenya', branch: '', accountNumber: '' },
        ],
        mpesaCustodyLine: '   ',
        includePostalMoneyOrder: false,
        postalAddress: 'unused',
      }),
    ).toEqual([])
  })
})
