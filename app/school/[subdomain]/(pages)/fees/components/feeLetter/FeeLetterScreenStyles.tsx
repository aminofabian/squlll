"use client";

import { FEE_LETTER_TEMPLATE_PRINT_CSS } from "../../lib/feeLetterPrintTemplates";

/** Template-specific letter styles for on-screen preview (print CSS is injected separately). */
export function FeeLetterScreenStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{ __html: FEE_LETTER_TEMPLATE_PRINT_CSS }}
      data-fee-letter-screen-styles
    />
  );
}
