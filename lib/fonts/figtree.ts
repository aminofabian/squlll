/** Figtree — site-wide UI and print font */
export const FIGTREE_FONT_FAMILY = "'Figtree', sans-serif";

export const FIGTREE_FONT_CSS_VAR = "var(--font-figtree), sans-serif";

export const FIGTREE_GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap";

/** Google Fonts `<link>` tags for standalone print/download HTML */
export function getFigtreePrintFontLinks(): string {
  return `<link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${FIGTREE_GOOGLE_FONTS_HREF}" rel="stylesheet" />`;
}

/** Inline `font-family` for print HTML `<style>` blocks */
export function figtreePrintBodyCss(extra = ""): string {
  return `font-family: ${FIGTREE_FONT_FAMILY}; ${extra}`.trim();
}
