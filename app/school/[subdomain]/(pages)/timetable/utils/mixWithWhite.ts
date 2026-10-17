const FALLBACK_RGB: [number, number, number] = [100, 116, 139];
const HEX_COLOR = /^#?([0-9a-f]{6})$/i;
const CHANNEL_MAX = 255;
const HEX_RADIX = 16;

/** `amount` of the colour over white: 0 is white, 1 is the colour itself. */
export function mixWithWhite(hex: string, amount: number): [number, number, number] {
  const match = HEX_COLOR.exec(hex.trim());
  const rgb: [number, number, number] = match
    ? [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), HEX_RADIX)) as [number, number, number]
    : FALLBACK_RGB;
  return rgb.map((channel) =>
    Math.round(CHANNEL_MAX - (CHANNEL_MAX - channel) * amount),
  ) as [number, number, number];
}
