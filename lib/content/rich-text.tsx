import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * Renders the small, safe markdown subset used inside content JSON strings:
 *   **bold**, *italic*, [link text](https://example.com)
 * Raw HTML is never rendered.
 */

const TOKEN_RE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g

const INTERNAL_LINK_CLASS =
  'font-medium text-[#1d5547] underline decoration-[#1d5547]/30 underline-offset-2 transition-colors hover:decoration-[#1d5547]'

function renderToken(token: string, key: number): ReactNode {
  const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
  if (link) {
    const [, label, href] = link
    if (/^https?:\/\//.test(href)) {
      return (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={INTERNAL_LINK_CLASS}
        >
          {label}
        </a>
      )
    }
    return (
      <Link key={key} href={href} className={INTERNAL_LINK_CLASS}>
        {label}
      </Link>
    )
  }

  const bold = token.match(/^\*\*([^*]+)\*\*$/)
  if (bold) {
    return (
      <strong key={key} className="font-semibold text-[#0a1f1a]">
        {bold[1]}
      </strong>
    )
  }

  const italic = token.match(/^\*([^*]+)\*$/)
  if (italic) {
    return <em key={key}>{italic[1]}</em>
  }

  return token
}

export function RichText({ text }: { text: string }) {
  const parts = text.split(TOKEN_RE).filter((part) => part !== '' && part !== undefined)
  return <>{parts.map((part, index) => renderToken(part, index))}</>
}
