/**
 * @deprecated Print now clones live app stylesheets (see feesPrint.ts) so output
 * matches preview. Kept for reference only — not loaded at runtime.
 *
 * Legacy template-specific print rules (iframe had no Tailwind).
 * Targets [data-fee-letter-template] on .fee-letter-doc.
 */
export const FEE_LETTER_TEMPLATE_PRINT_CSS = `
  body {
    font-family: inherit;
  }

  /* —— Modern —— */
  [data-fee-letter-template="modern"] h2 {
    color: #0f172a !important;
    text-decoration: none;
    font-weight: 600;
  }

  [data-fee-letter-template="modern"] h3 {
    color: #0f172a !important;
    text-decoration: none;
  }

  [data-fee-letter-template="modern"] .fee-letter-modern-header-body {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    padding: 1rem 0;
  }

  [data-fee-letter-template="modern"] .fee-letter-modern-header-accent {
    height: 1px;
    background: linear-gradient(90deg, transparent, #94a3b8, transparent) !important;
  }

  [data-fee-letter-template="modern"] .fee-letter-modern-matrix-table thead th {
    background: linear-gradient(180deg, #0f172a, #1e3a5f) !important;
    color: #fff !important;
    border: none !important;
    padding: 0.6rem 0.5rem;
  }

  [data-fee-letter-template="modern"] .fee-letter-modern-matrix-vote {
    border-bottom: 1px solid #e2e8f0 !important;
    padding: 0.5rem 0.85rem;
  }

  [data-fee-letter-template="modern"] .fee-letter-modern-matrix-amt {
    border-bottom: 1px solid #e2e8f0 !important;
    text-align: right;
    padding: 0.5rem 0.65rem;
    font-size: 12px;
  }

  [data-fee-letter-template="modern"] .fee-letter-modern-matrix-row--odd {
    background: #f8fafc !important;
  }

  [data-fee-letter-template="modern"] .fee-letter-modern-matrix-row--even {
    background: #fff !important;
  }

  [data-fee-letter-template="modern"] .fee-letter-modern-optional {
    color: #94a3b8 !important;
    background: transparent !important;
  }

  [data-fee-letter-template="modern"] .fee-letter-modern-matrix-totals td {
    color: #fff !important;
    font-weight: 600;
    border: none !important;
  }

  [data-fee-letter-template="modern"] .fee-letter-modern-matrix-totals-label {
    background: #0f172a !important;
  }

  [data-fee-letter-template="modern"] .fee-letter-modern-matrix-totals-cell {
    background: #1e3a5f !important;
  }

  [data-fee-letter-template="modern"] .fee-letter-modern-matrix-summary {
    border-top: 1px solid #e2e8f0;
    padding-top: 0.75rem;
    margin-top: 1rem;
  }

  [data-fee-letter-template="modern"] .fee-letter-modern-matrix-shell {
    border: 1px solid #e2e8f0 !important;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  /* —— Formal ministry —— */
  [data-fee-letter-template="formal"] .fee-letter-doc {
    background: #faf7f2 !important;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-manuscript {
    background: #faf7f2 !important;
    font-family: Figtree, sans-serif;
    position: relative;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-outer {
    border: 2px solid #9a7b4f !important;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-inner {
    border: 3px double #5c1a2e !important;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-body {
    padding: 2rem 2.25rem;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-header {
    text-align: center;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-school {
    color: #5c1a2e !important;
    font-size: 1.15rem;
    text-transform: uppercase;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-republic {
    color: #5c1a2e !important;
    letter-spacing: 0.35em;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-title {
    text-transform: uppercase;
    font-weight: bold;
    text-align: center;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-dispatch p {
    text-align: justify;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-schedule-badge {
    background: #5c1a2e !important;
    color: #fff !important;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-table thead tr,
  [data-fee-letter-template="formal"] .fee-letter-formal-table .fee-letter-formal-totals td {
    background: #5c1a2e !important;
    color: #fff !important;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-table th,
  [data-fee-letter-template="formal"] .fee-letter-formal-table td {
    border: 1px solid #78716c !important;
    padding: 4px 6px;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-row--alt {
    background: #f5f0e8 !important;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-totals td[colspan] {
    background: #5c1a2e !important;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-seal {
    border: 2px dashed #5c1a2e !important;
    color: #5c1a2e !important;
    width: 4.5rem;
    height: 4.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 8px;
    margin: 0 auto;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-section-title {
    color: #5c1a2e !important;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-banks {
    margin-left: 1.5rem;
    list-style: decimal;
  }

  [data-fee-letter-template="formal"] .fee-letter-formal-auth {
    page-break-inside: avoid;
  }

  [data-fee-letter-template="formal"] h2 {
    text-decoration: none;
  }

  /* —— Compact docket —— */
  [data-fee-letter-template="compact"] .fee-letter-doc {
    padding: 10mm !important;
    font-size: 10px !important;
    line-height: 1.25 !important;
  }

  [data-fee-letter-template="compact"] .fee-letter-compact-bar {
    background: #1e293b !important;
    color: #fff !important;
    display: flex;
    justify-content: space-between;
    padding: 4px 8px;
  }

  [data-fee-letter-template="compact"] .fee-letter-compact-header {
    margin-bottom: 0.5rem;
  }

  [data-fee-letter-template="compact"] h2 {
    font-size: 12px !important;
    text-decoration: none;
    text-transform: uppercase;
  }

  [data-fee-letter-template="compact"] .fee-letter-compact-table th,
  [data-fee-letter-template="compact"] .fee-letter-compact-table td {
    border: 1px solid #64748b !important;
    padding: 2px 4px !important;
    font-size: 9px !important;
  }

  [data-fee-letter-template="compact"] .fee-letter-compact-table thead tr {
    background: #e2e8f0 !important;
  }

  [data-fee-letter-template="compact"] .fee-letter-compact-row--alt {
    background: #f8fafc !important;
  }

  [data-fee-letter-template="compact"] .fee-letter-compact-totals {
    background: #cbd5e1 !important;
    font-weight: bold;
  }

  [data-fee-letter-template="compact"] .fee-letter-compact-footer {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    page-break-inside: avoid;
  }

  [data-fee-letter-template="compact"] .fee-letter-compact-payment,
  [data-fee-letter-template="compact"] .fee-letter-compact-sign {
    border: 1px solid #64748b;
    padding: 6px 8px;
    page-break-inside: avoid;
  }

  [data-fee-letter-template="compact"] .fee-letter-compact-schedule {
    page-break-inside: auto;
    margin-bottom: 0.5rem;
  }

  /* —— Brand banner —— */
  [data-fee-letter-template="banner"] {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-doc {
    font-family: Figtree, sans-serif;
  }

  /* Undo global letter heading rules that add underlines / centering */
  [data-fee-letter-template="banner"] h1,
  [data-fee-letter-template="banner"] .fee-letter-brand-hero-title {
    text-decoration: none !important;
    text-align: left !important;
    margin: 0.25rem 0 0 !important;
    font-size: 1.35rem !important;
    color: #fff !important;
  }

  [data-fee-letter-template="banner"] h2,
  [data-fee-letter-template="banner"] .fee-letter-brand-matrix-title {
    text-decoration: none !important;
    text-align: left !important;
    margin: 0 0 0.25rem !important;
    font-size: 0.8rem !important;
    color: #0f172a !important;
  }

  [data-fee-letter-template="banner"] h3,
  [data-fee-letter-template="banner"] .fee-letter-brand-payment-title {
    text-decoration: none !important;
    margin: 0 !important;
    color: #fff !important;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-top {
    page-break-inside: avoid;
    break-inside: avoid;
    overflow: visible !important;
    margin-bottom: 1.25rem;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-hero {
    position: relative;
    margin: 0;
    min-height: 8.5rem;
    overflow: visible !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-hero p {
    margin: 0.2rem 0 0 !important;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-hero-content {
    display: flex !important;
    align-items: stretch;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-hero-date {
    display: block !important;
    flex-shrink: 0;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-hero-slice {
    display: block !important;
    width: 100% !important;
    height: 40px !important;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-spotlights {
    position: relative !important;
    z-index: 2;
    margin-top: -1.5rem !important;
    margin-bottom: 1.5rem !important;
    padding: 0 0.25rem;
    overflow: visible !important;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-spotlight-grid {
    display: grid !important;
    gap: 0.75rem !important;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-spotlight-grid[data-cols="1"] {
    grid-template-columns: 1fr !important;
    max-width: 12rem;
    margin-left: auto;
    margin-right: auto;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-spotlight-grid[data-cols="2"] {
    grid-template-columns: 1fr 1fr !important;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-spotlight-grid[data-cols="3"] {
    grid-template-columns: 1fr 1fr 1fr !important;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-spotlight-card {
    background: #fff !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 0.75rem !important;
    text-align: center;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-spotlight-accent {
    height: 6px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    background: var(--fee-letter-brand, #166534) !important;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-spotlight-total {
    border-radius: 0.75rem !important;
    background: var(--fee-letter-brand, #166534) !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-spotlight-total-inner {
    display: flex !important;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 1rem;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-spotlight-total p,
  [data-fee-letter-template="banner"] .fee-letter-brand-spotlight-total span {
    color: #fff !important;
    margin: 0 !important;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-matrix .flex {
    display: flex !important;
    align-items: center;
    gap: 0.5rem;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-table th,
  [data-fee-letter-template="banner"] .fee-letter-brand-table td {
    border: 1px solid #e2e8f0 !important;
    padding: 0.4rem 0.5rem !important;
    color: #0f172a !important;
    text-align: inherit;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-table thead th {
    background: var(--fee-letter-brand, #166534) !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-table-shell {
    border: 1px solid #e2e8f0 !important;
    border-radius: 0.75rem;
    overflow: hidden;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-table .text-right,
  [data-fee-letter-template="banner"] .fee-letter-brand-table th[style*="text-align: right"],
  [data-fee-letter-template="banner"] .fee-letter-brand-table td[style*="text-align: right"] {
    text-align: right !important;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-row--alt td {
    background: #f8fafc !important;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-matrix {
    page-break-inside: auto;
    break-inside: auto;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-footer {
    page-break-inside: avoid;
    break-inside: avoid;
    margin-top: 0.5rem;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-payment {
    border-radius: 0.65rem;
    overflow: hidden;
    margin-bottom: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-payment-grid {
    display: grid !important;
    grid-template-columns: 1fr 1.2fr !important;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-payment-intro {
    border-right: 1px solid rgba(255, 255, 255, 0.2) !important;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-payment-banks {
    background: rgba(0, 0, 0, 0.15) !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-payment p,
  [data-fee-letter-template="banner"] .fee-letter-brand-payment li,
  [data-fee-letter-template="banner"] .fee-letter-brand-payment span {
    color: #fff !important;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-payment-notes {
    border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
    background: rgba(0, 0, 0, 0.1) !important;
    color: rgba(255, 255, 255, 0.92) !important;
  }

  [data-fee-letter-template="banner"] .fee-letter-brand-signoff {
    display: flex !important;
    justify-content: space-between;
    align-items: flex-end;
    border-top: 1px solid #e2e8f0 !important;
    padding-top: 1.25rem !important;
    margin-top: 2rem !important;
  }

  /* —— Kenya circular —— */
  [data-fee-letter-template="kenya"] .fee-letter-kenya-tricolor {
    display: flex;
    height: 8px;
  }

  [data-fee-letter-template="kenya"] .fee-letter-kenya-ring-outer {
    border: 3px solid #006600 !important;
    box-shadow: inset 0 0 0 1px #b8860b;
    padding: 1.5rem 1.75rem;
  }

  [data-fee-letter-template="kenya"] .fee-letter-kenya-header {
    text-align: center;
  }

  [data-fee-letter-template="kenya"] .fee-letter-kenya-school {
    color: #004d00 !important;
    text-transform: uppercase;
  }

  [data-fee-letter-template="kenya"] .fee-letter-kenya-republic {
    color: #006600 !important;
    letter-spacing: 0.4em;
  }

  [data-fee-letter-template="kenya"] .fee-letter-kenya-meta {
    background: #fef9e7 !important;
    border: 1px solid rgba(184, 134, 11, 0.35);
    padding: 0.75rem 1rem;
  }

  [data-fee-letter-template="kenya"] .fee-letter-kenya-table-wrap {
    border: 2px solid #006600 !important;
  }

  [data-fee-letter-template="kenya"] .fee-letter-kenya-table thead th {
    background: #006600 !important;
    color: #fff !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  [data-fee-letter-template="kenya"] .fee-letter-kenya-table thead th span {
    color: #fff !important;
  }

  [data-fee-letter-template="kenya"] .fee-letter-kenya-table th,
  [data-fee-letter-template="kenya"] .fee-letter-kenya-table td {
    border: 1px solid #a8a29e;
    padding: 4px 6px;
    color: #1a1a1a;
  }

  [data-fee-letter-template="kenya"] .fee-letter-kenya-row--alt {
    background: #fef9e7 !important;
  }

  [data-fee-letter-template="kenya"] .fee-letter-kenya-totals td {
    background: #006600 !important;
    color: #fff !important;
    font-weight: bold;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  [data-fee-letter-template="kenya"] .fee-letter-kenya-totals td:first-child {
    background: #004d00 !important;
  }

  [data-fee-letter-template="kenya"] .fee-letter-kenya-totals td span {
    color: #fff !important;
  }

  [data-fee-letter-template="kenya"] .fee-letter-kenya-stamp-slot {
    width: 45mm !important;
    height: 45mm !important;
    background: #fff !important;
    border: 2px dashed #006600 !important;
    border-radius: 50%;
    box-sizing: border-box;
  }

  [data-fee-letter-template="kenya"] .fee-letter-kenya-gold-rule {
    height: 4px;
    background: linear-gradient(90deg, #006600, #b8860b, #006600) !important;
  }

  [data-fee-letter-template="kenya"] .fee-letter-kenya-footer-note {
    color: #006600 !important;
    font-style: italic;
    text-align: center;
  }

  [data-fee-letter-template="kenya"] .fee-letter-kenya-auth {
    page-break-inside: avoid;
  }
`
