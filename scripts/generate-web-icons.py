#!/usr/bin/env python3
"""Generate the web favicon / apple-touch / Open Graph assets from the brand master.

Usage (from `frontend/`):

    python3 -m venv .venv-icons
    .venv-icons/bin/pip install Pillow numpy
    .venv-icons/bin/python scripts/generate-web-icons.py [master.png]

The master defaults to the mobile repo's copy so there is a single source of
truth (`../mobile/assets/images/icon-source.png`); pass a path to override.

Writes into `public/`:
    icon-192.png      browser favicon (modern)
    icon-512.png      large icon / PWA
    apple-icon.png    apple-touch-icon (180)
    og-image.png      Open Graph / Twitter card (1200x630)
    squl-logo.png     in-app / structured-data logo (marksheet header, blog JSON-LD)

And `public/favicon.svg` (served at `/favicon.svg`): the mark embedded as a PNG,
because the traced artwork isn't vectorisable. Note it must live in `public/` —
`app/favicon.svg` is not one of Next's special metadata files, so it is never
served (only `icon.*` / `favicon.ico` / `apple-icon.*` are).
"""

import base64
import io
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / "mobile/assets/images/icon-source.png"
OUT = ROOT / "public"

CORNER_BLOCK = 0.18
DARK_CUTOFF = 35
GLYPH_RAMP = (120, 200)
BG_GRADIENT_SIZE = 1024
OG_SIZE = (1200, 630)
OG_GLYPH_HEIGHT = 250

BOLD_FONTS = (
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
)
REGULAR_FONTS = (
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
)


def load_font(size: int, candidates) -> ImageFont.FreeTypeFont:
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size)


def main() -> None:
    im = Image.open(SRC).convert("RGB")
    lum = np.asarray(im).astype(np.float32).mean(axis=2)

    ys, xs = np.where(lum > DARK_CUTOFF)
    x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())
    side = min(x1 - x0 + 1, y1 - y0 + 1)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    sq = np.asarray(
        im.crop((cx - side // 2, cy - side // 2, cx - side // 2 + side, cy - side // 2 + side))
    ).astype(np.float32)
    sqlum = sq.mean(axis=2)

    b = int(sq.shape[0] * CORNER_BLOCK)

    def corner(y: int, x: int) -> np.ndarray:
        blk = sq[y : y + b, x : x + b].reshape(-1, 3)
        bl = blk.mean(axis=1)
        return np.median(blk[(bl > DARK_CUTOFF) & (bl < GLYPH_RAMP[0])], axis=0)

    tl, tr = corner(0, 0), corner(0, sq.shape[0] - b)
    bl, br = corner(sq.shape[0] - b, 0), corner(sq.shape[0] - b, sq.shape[0] - b)

    def gradient(width: int, height: int) -> np.ndarray:
        tx = np.linspace(0.0, 1.0, width, dtype=np.float32)[None, :, None]
        ty = np.linspace(0.0, 1.0, height, dtype=np.float32)[:, None, None]
        return (tl * (1 - tx) + tr * tx) * (1 - ty) + (bl * (1 - tx) + br * tx) * ty

    bg = Image.fromarray(gradient(BG_GRADIENT_SIZE, BG_GRADIENT_SIZE).astype(np.uint8))

    alpha = np.clip((sqlum - GLYPH_RAMP[0]) / (GLYPH_RAMP[1] - GLYPH_RAMP[0]), 0, 1)
    mask = alpha > 0.5
    colour = np.median(sq[mask], axis=0)
    gys, gxs = np.where(mask)
    pad = 4
    box = (
        max(0, int(gxs.min()) - pad),
        max(0, int(gys.min()) - pad),
        int(gxs.max()) + pad + 1,
        int(gys.max()) + pad + 1,
    )
    rgba = np.zeros((*sq.shape[:2], 4), dtype=np.uint8)
    rgba[..., 0], rgba[..., 1], rgba[..., 2] = (int(round(v)) for v in colour)
    rgba[..., 3] = (alpha * 255).astype(np.uint8)
    glyph = Image.fromarray(rgba, "RGBA").crop(box)
    print("glyph", glyph.size, "colour #%02X%02X%02X" % tuple(int(round(v)) for v in colour))

    def place(src: Image.Image, canvas: int, frac: float) -> Image.Image:
        scale = (canvas * frac) / max(src.size)
        size = (max(1, round(src.width * scale)), max(1, round(src.height * scale)))
        out = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
        g = src.resize(size, Image.LANCZOS)
        out.alpha_composite(g, ((canvas - size[0]) // 2, (canvas - size[1]) // 2))
        return out

    def icon(size: int, frac: float) -> Image.Image:
        base = bg.resize((size, size), Image.LANCZOS).convert("RGBA")
        base.alpha_composite(place(glyph, size, frac))
        return base.convert("RGB")

    OUT.mkdir(parents=True, exist_ok=True)
    # Small sizes need the mark a little larger to stay legible.
    icon(512, 0.62).save(OUT / "icon-512.png")
    icon(192, 0.70).save(OUT / "icon-192.png")
    icon(180, 0.70).save(OUT / "apple-icon.png")
    # In-app / structured-data logo: rendered at ~80px in the marksheet header and
    # referenced by the blog JSON-LD.
    icon(256, 0.70).save(OUT / "squl-logo.png")

    # /favicon.svg — the mark as an embedded PNG (SVG has no raster tracing here)
    favicon = io.BytesIO()
    icon(256, 0.70).save(favicon, "PNG", optimize=True)
    b64 = base64.b64encode(favicon.getvalue()).decode("ascii")
    (OUT / "favicon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" '
        'viewBox="0 0 256 256">\n'
        f'  <image href="data:image/png;base64,{b64}" width="256" height="256"/>\n'
        '</svg>\n',
        encoding="utf-8",
    )

    # --- Open Graph card ---
    w, h = OG_SIZE
    og = Image.fromarray(gradient(w, h).astype(np.uint8))
    gh = OG_GLYPH_HEIGHT
    g = glyph.resize((round(glyph.width * gh / glyph.height), gh), Image.LANCZOS)
    og.paste(g, ((w - g.width) // 2, 108), g)

    draw = ImageDraw.Draw(og)
    bold = load_font(84, BOLD_FONTS)
    word = "SQUL"
    box = draw.textbbox((0, 0), word, font=bold)
    draw.text(((w - (box[2] - box[0])) / 2 - box[0], 396), word, font=bold, fill=(255, 255, 255))

    regular = load_font(30, REGULAR_FONTS)
    tagline = "Kenya School Management System"
    box = draw.textbbox((0, 0), tagline, font=regular)
    draw.text(
        ((w - (box[2] - box[0])) / 2 - box[0], 508),
        tagline,
        font=regular,
        fill=(198, 216, 208),
    )
    og.save(OUT / "og-image.png")

    print(f"wrote icon-192.png, icon-512.png, apple-icon.png, og-image.png, squl-logo.png, favicon.svg to {OUT}")


if __name__ == "__main__":
    main()
