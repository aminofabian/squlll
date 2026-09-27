import { OG_SIZE, renderIndexCard } from '@/lib/og/card'

export const runtime = 'nodejs'
export const alt = 'SQUL blog — school management guides for Kenyan schools'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return renderIndexCard()
}
