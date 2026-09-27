import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ReactElement } from 'react'
import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }

type FontEntry = {
  name: string
  data: Buffer
  weight: 400
  style: 'normal'
}

let cachedFonts: FontEntry[] | null | undefined

/**
 * Loads the brand fonts vendored under /public/fonts. Falls back to the
 * renderer's built-in font if the files are unavailable (e.g. a trimmed
 * deployment) so image generation never hard-fails.
 */
function loadFonts(): FontEntry[] | undefined {
  if (cachedFonts !== undefined) return cachedFonts ?? undefined
  try {
    const dir = join(process.cwd(), 'public', 'fonts')
    const serif = readFileSync(join(dir, 'InstrumentSerif-Regular.ttf'))
    cachedFonts = [
      { name: 'Instrument Serif', data: serif, weight: 400, style: 'normal' },
    ]
    return cachedFonts
  } catch {
    cachedFonts = null
    return undefined
  }
}

function titleSize(title: string) {
  if (title.length > 78) return 50
  if (title.length > 58) return 58
  return 66
}

function Card({
  title,
  kicker,
  footerLeft,
  footerRight,
}: {
  title: string
  kicker: string
  footerLeft: string
  footerRight: string
}) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#0a1f1a',
        backgroundImage:
          'radial-gradient(circle at 12% 18%, rgba(36,106,89,0.55), transparent 55%), radial-gradient(circle at 92% 8%, rgba(45,133,112,0.4), transparent 50%)',
        padding: 72,
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              background: 'linear-gradient(180deg, #246a59, #1a4c40)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 34,
              fontWeight: 600,
            }}
          >
            S
          </div>
          <div style={{ fontSize: 34, letterSpacing: 3, fontWeight: 600 }}>SQUL</div>
        </div>
        <div
          style={{
            fontSize: 22,
            color: '#7fd3b5',
            textTransform: 'uppercase',
            letterSpacing: 5,
            fontWeight: 600,
          }}
        >
          {kicker}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          fontFamily: 'Instrument Serif',
          fontWeight: 400,
          fontSize: titleSize(title),
          lineHeight: 1.12,
          maxWidth: 1020,
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 23,
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        <div>{footerLeft}</div>
        <div>{footerRight}</div>
      </div>
    </div>
  )
}

function respond(element: ReactElement) {
  const fonts = loadFonts()
  return new ImageResponse(element, { ...OG_SIZE, ...(fonts ? { fonts } : {}) })
}

export function renderArticleCard({ title, kicker }: { title: string; kicker: string }) {
  return respond(
    <Card
      title={title}
      kicker={kicker}
      footerLeft="squl.co.ke/blog"
      footerRight="School management for Kenyan schools"
    />,
  )
}

export function renderIndexCard() {
  return respond(
    <Card
      title="School management, explained for Kenyan schools"
      kicker="Guides & resources"
      footerLeft="squl.co.ke/blog"
      footerRight="Fees · M-Pesa · WhatsApp · CBC · Timetables"
    />,
  )
}
