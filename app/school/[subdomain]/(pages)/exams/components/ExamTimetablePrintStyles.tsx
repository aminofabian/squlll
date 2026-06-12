'use client'

import { useEffect } from 'react'

/** Hides app chrome when printing the exam timetable from the browser. */
export function ExamTimetablePrintStyles() {
  useEffect(() => {
    const id = 'exam-timetable-print-styles'
    if (document.getElementById(id)) return

    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      .exam-print-root {
        display: none;
      }

      @media print {
        @page {
          size: A4 portrait;
          margin: 10mm;
        }

        @page landscape-page {
          size: A4 landscape;
          margin: 10mm;
        }

        [data-exam-print-orientation="landscape"] {
          page: landscape-page;
        }

        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }

        body > *:not([data-exam-timetable-print-root]) {
          display: none !important;
        }

        [data-exam-timetable-print-root] {
          display: block !important;
          width: 100% !important;
          background: white !important;
          color: #0f172a !important;
          font-family: system-ui, -apple-system, sans-serif !important;
        }

        [data-exam-timetable-print-root] table {
          display: table !important;
          width: 100% !important;
          border-collapse: collapse !important;
          table-layout: fixed !important;
        }

        [data-exam-timetable-print-root] thead {
          display: table-header-group !important;
        }

        [data-exam-timetable-print-root] tbody {
          display: table-row-group !important;
        }

        [data-exam-timetable-print-root] tr {
          display: table-row !important;
        }

        [data-exam-timetable-print-root] th,
        [data-exam-timetable-print-root] td {
          display: table-cell !important;
        }

        .exam-print-header {
          margin: 0 0 4mm;
          padding: 3mm;
          border: 1.5px solid #246a59;
          border-radius: 2mm;
          background: linear-gradient(
            180deg,
            rgba(36, 106, 89, 0.06) 0%,
            rgba(255, 255, 255, 1) 100%
          ) !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .exam-print-header-row {
          display: flex !important;
          align-items: center;
          justify-content: space-between;
          gap: 3mm;
        }

        .exam-print-header-row--nav {
          margin-bottom: 1.5mm;
        }

        .exam-print-kicker {
          margin: 0;
          font-size: 6.5pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #246a59;
        }

        .exam-print-badge {
          display: inline-block;
          padding: 0.6mm 2mm;
          border: 1px solid rgba(36, 106, 89, 0.35);
          border-radius: 2mm;
          background: rgba(36, 106, 89, 0.08) !important;
          font-size: 7pt;
          font-weight: 600;
          color: #246a59;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .exam-print-title {
          margin: 0 0 2mm;
          font-size: 14pt;
          font-weight: 700;
          line-height: 1.15;
          color: #0f172a;
        }

        .exam-print-context-strip {
          display: flex !important;
          flex-wrap: wrap;
          gap: 1.5mm;
          margin-bottom: 2.5mm;
        }

        .exam-print-chip {
          display: inline-block;
          padding: 0.8mm 2mm;
          border: 1px solid rgba(36, 106, 89, 0.25);
          border-radius: 1.5mm;
          background: white !important;
          font-size: 7.5pt;
          line-height: 1.3;
          color: #475569;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .exam-print-stats {
          display: flex !important;
          gap: 2mm;
        }

        .exam-print-stat {
          display: flex !important;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 14mm;
          padding: 1.5mm 3mm;
          border: 1px solid rgba(36, 106, 89, 0.2);
          border-radius: 1.5mm;
          background: white !important;
          text-align: center;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .exam-print-stat strong {
          display: block;
          font-size: 11pt;
          font-weight: 700;
          line-height: 1.1;
          color: #246a59;
        }

        .exam-print-stat span {
          display: block;
          margin-top: 0.5mm;
          font-size: 6pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }

        .exam-print-section {
          margin: 0 0 6mm;
        }

        .exam-print-section:not(:last-child) {
          page-break-after: always;
        }

        .exam-print-section-head {
          display: flex !important;
          justify-content: space-between;
          align-items: center;
          margin: 0 0 2mm;
          padding: 1.5mm 2mm;
          border-left: 2px solid #246a59;
          background: rgba(36, 106, 89, 0.05) !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .exam-print-section-head h2 {
          margin: 0;
          font-size: 10pt;
          font-weight: 700;
          color: #246a59;
        }

        .exam-print-section-head span {
          font-size: 7.5pt;
          font-weight: 600;
          color: #64748b;
        }

        .exam-print-table {
          border: 1.5px solid #246a59;
          font-size: 8pt;
        }

        .exam-print-col-time {
          width: 12mm;
        }

        .exam-print-table th {
          background: rgba(36, 106, 89, 0.08) !important;
          border: 1px solid #246a59;
          padding: 2mm 1mm;
          text-align: center;
          vertical-align: middle;
          font-size: 7pt;
          font-weight: 700;
          text-transform: uppercase;
          color: #246a59;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .exam-print-th-line1 {
          display: block;
          letter-spacing: 0.04em;
        }

        .exam-print-th-line2 {
          display: block;
          margin-top: 0.5mm;
          font-size: 8pt;
          font-weight: 700;
          text-transform: none;
          color: #0f172a;
        }

        .exam-print-time-cell {
          background: #f8fafc !important;
          border: 1px solid #246a59;
          padding: 1mm;
          text-align: center;
          vertical-align: middle;
          font-family: ui-monospace, Menlo, monospace;
          font-size: 7pt;
          font-weight: 600;
          color: #64748b;
          height: 7mm;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .exam-print-empty-cell {
          border: 1px solid rgba(36, 106, 89, 0.35);
          background: #fafafa !important;
          height: 7mm;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .exam-print-exam-cell {
          border: 1.5px solid;
          padding: 1.5mm;
          text-align: center;
          vertical-align: middle;
          height: 7mm;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .exam-print-exam-cell-inner {
          display: block;
        }

        .exam-print-exam-cell-inner strong {
          display: block;
          font-size: 7.5pt;
          font-weight: 700;
          line-height: 1.25;
          margin-bottom: 0.5mm;
        }

        .exam-print-exam-cell-inner span {
          display: block;
          font-size: 6.5pt;
          line-height: 1.25;
        }

        .exam-print-exam-range {
          font-family: ui-monospace, Menlo, monospace;
          opacity: 0.85;
        }

        .exam-print-empty {
          font-size: 9pt;
          color: #475569;
        }

        .exam-print-legend {
          margin-top: 2mm;
          padding: 2mm 2.5mm;
          border: 1px solid rgba(36, 106, 89, 0.25);
          border-radius: 1.5mm;
          background: rgba(36, 106, 89, 0.03) !important;
          page-break-inside: avoid;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .exam-print-legend-title {
          margin: 0 0 1.2mm;
          font-size: 6pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #246a59;
        }

        .exam-print-legend-columns {
          display: grid !important;
          grid-template-columns: 1fr 1fr;
          gap: 0 4mm;
        }

        .exam-print-legend-col {
          display: block !important;
          min-width: 0;
        }

        .exam-print-legend-col .exam-print-legend-item + .exam-print-legend-item {
          margin-top: 1.2mm;
        }

        .exam-print-legend-item {
          display: block !important;
          margin: 0;
          padding: 0;
          line-height: 1.2;
        }

        .exam-print-legend-code {
          display: block !important;
          font-family: ui-monospace, Menlo, monospace;
          font-size: 6pt;
          font-weight: 700;
          color: #246a59;
          line-height: 1.2;
        }

        .exam-print-legend-name {
          display: block !important;
          margin-top: 0.3mm;
          font-size: 5.5pt;
          line-height: 1.25;
          color: #475569;
          word-break: break-word;
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      style.remove()
    }
  }, [])

  return null
}
