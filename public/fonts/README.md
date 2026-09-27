# Vendored fonts

These font files are used only by the Open Graph / Twitter image renderer
(`lib/og/card.tsx`) via `next/og`. They are not part of the site's CSS pipeline —
the app loads its fonts through `next/font/google` in `app/layout.tsx`.

| File | Family | License |
| --- | --- | --- |
| `InstrumentSerif-Regular.ttf` | Instrument Serif | SIL Open Font License 1.1 |

Source: <https://github.com/google/fonts/tree/main/ofl/instrumentserif>

The image renderer falls back to its built-in sans font if this file is missing,
so a trimmed deployment will still generate cards (with a sans-serif title).
