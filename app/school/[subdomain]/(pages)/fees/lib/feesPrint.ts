/**
 * Print the fee letter so it matches the on-screen preview.
 *
 * We clone the live document's stylesheets (Tailwind + globals) into a sized
 * iframe and print that — not a hand-maintained CSS reimplementation.
 */
export const FEE_LETTER_PRINT_MINIMAL_CSS = `
  @page {
    size: A4;
    margin: 15mm;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  [data-fee-pdf-document] {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Safety: cap logo size if utilities fail to load */
  .fee-letter-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    width: 72px;
    height: 78px;
    max-width: 72px;
    max-height: 78px;
  }

  .fee-letter-logo--sm {
    width: 44px;
    height: 48px;
    max-width: 44px;
    max-height: 48px;
  }

  .fee-letter-logo img,
  .fee-letter-logo svg {
    display: block;
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
    object-fit: contain;
  }

  [data-fee-pdf-document] thead {
    display: table-header-group;
  }

  [data-fee-pdf-document] table {
    page-break-inside: auto;
  }

  [data-fee-pdf-document] tr {
    page-break-inside: auto;
    break-inside: auto;
  }

  /* Kenya circular — physical stamp space (~45mm) */
  .fee-letter-kenya-stamp-slot {
    width: 45mm !important;
    height: 45mm !important;
    min-width: 45mm;
    min-height: 45mm;
    background: #fff !important;
    border-radius: 50%;
    box-sizing: border-box;
  }
`

function copyDocumentStyles(targetDoc: Document) {
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    try {
      targetDoc.head.appendChild(node.cloneNode(true))
    } catch {
      // Skip nodes that cannot be cloned (e.g. rare cross-origin cases)
    }
  })
}

function waitForImages(doc: Document, onReady: () => void) {
  const images = Array.from(doc.images)
  if (images.length === 0) {
    setTimeout(onReady, 150)
    return
  }
  let done = 0
  const check = () => {
    done += 1
    if (done >= images.length) onReady()
  }
  images.forEach((img) => {
    if (img.complete) check()
    else {
      img.onload = check
      img.onerror = check
    }
  })
  setTimeout(onReady, 3000)
}

function waitForPrintReady(doc: Document, onReady: () => void) {
  const start = () => waitForImages(doc, onReady)
  if (typeof document.fonts?.ready !== 'undefined') {
    document.fonts.ready.then(start).catch(start)
    return
  }
  start()
}

function isVisibleLetter(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return false
  if (rect.left < -400 || rect.top < -400) return false
  return true
}

function resolveLetterElement(root?: HTMLElement | null): HTMLElement | null {
  const dialogLetter = document.querySelector<HTMLElement>(
    '[role="dialog"] [data-fee-pdf-document]',
  )
  if (dialogLetter && isVisibleLetter(dialogLetter)) {
    return dialogLetter
  }

  const candidates: HTMLElement[] = []

  if (root) {
    if (root.hasAttribute('data-fee-pdf-document')) {
      candidates.push(root)
    } else {
      const nested = root.querySelector<HTMLElement>('[data-fee-pdf-document]')
      if (nested) candidates.push(nested)
    }
  }

  document
    .querySelectorAll<HTMLElement>('[data-fee-pdf-document]')
    .forEach((el) => {
      if (!candidates.includes(el)) candidates.push(el)
    })

  const visible = candidates.find(isVisibleLetter)
  if (visible) return visible

  return candidates[0] ?? null
}

/**
 * Print only the fee-structure letter (never the surrounding drawer/page).
 * Clones app CSS so output matches the preview (Tailwind, colors, layout).
 */
export function printFeeStructureLetter(root?: HTMLElement | null): void {
  const el = resolveLetterElement(root)
  if (!el) {
    console.warn('[feesPrint] No fee letter element to print')
    return
  }

  const title =
    el.querySelector('h1')?.textContent?.trim() ||
    el.querySelector('h2')?.textContent?.trim() ||
    'Fee Structure'

  const iframe = document.createElement('iframe')
  iframe.setAttribute('title', 'Fee structure print')
  // Full A4 width so sm:/md: breakpoints match the preview panel
  iframe.style.cssText =
    'position:fixed;left:-10000px;top:0;width:210mm;min-height:297mm;border:0;visibility:hidden'
  document.body.appendChild(iframe)

  const win = iframe.contentWindow
  const doc = win?.document
  if (!doc) {
    iframe.remove()
    return
  }

  doc.open()
  doc.write('<!DOCTYPE html><html lang="en"><head></head><body></body></html>')
  doc.close()

  doc.title = title.replace(/</g, '')

  copyDocumentStyles(doc)

  const overrides = doc.createElement('style')
  overrides.textContent = FEE_LETTER_PRINT_MINIMAL_CSS
  doc.head.appendChild(overrides)

  const clone = el.cloneNode(true) as HTMLElement
  doc.body.appendChild(clone)
  doc.body.style.margin = '0'
  doc.body.style.background = '#fff'

  const cleanup = () => {
    setTimeout(() => iframe.remove(), 500)
  }

  waitForPrintReady(doc, () => {
    try {
      win?.focus()
      win?.print()
    } finally {
      cleanup()
    }
  })
}
