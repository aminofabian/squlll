/** Figtree — site-wide UI and print font */
export const FIGTREE_FONT_FAMILY = "'Figtree', sans-serif";

export const FIGTREE_FONT_CSS_VAR = "var(--font-figtree), sans-serif";

/** GDPR-friendly Bunny Fonts CDN (drop-in replacement for Google Fonts) */
export const FIGTREE_BUNNY_FONTS_HREF =
  "https://fonts.bunny.net/css2?family=figtree:ital,wght@0,300..900;1,300..900&display=swap";

/** @deprecated Use FIGTREE_BUNNY_FONTS_HREF */
export const FIGTREE_GOOGLE_FONTS_HREF = FIGTREE_BUNNY_FONTS_HREF;

/** Bunny Fonts `<link>` tags for standalone print/download HTML */
export function getFigtreePrintFontLinks(): string {
  return `<link rel="preconnect" href="https://fonts.bunny.net" />
  <link href="${FIGTREE_BUNNY_FONTS_HREF}" rel="stylesheet" />`;
}

/** Inline `font-family` for print HTML `<style>` blocks */
export function figtreePrintBodyCss(extra = ""): string {
  return `font-family: ${FIGTREE_FONT_FAMILY}; ${extra}`.trim();
}
