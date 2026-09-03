import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

type Rgb = [number, number, number];

function rgb(hex: string): Rgb {
  const value = hex.replace("#", "");
  return [0, 2, 4].map(index => Number.parseInt(value.slice(index, index + 2), 16)) as Rgb;
}

function blend(foreground: Rgb, background: Rgb, opacity: number): Rgb {
  return foreground.map((value, index) => Math.round(value * opacity + background[index]! * (1 - opacity))) as Rgb;
}

function luminance(color: Rgb) {
  const channels = color.map(value => {
    const channel = value / 255;
    return channel <= .03928 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return .2126 * channels[0]! + .7152 * channels[1]! + .0722 * channels[2]!;
}

function contrast(foreground: Rgb, background: Rgb) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0]! + .05) / (values[1]! + .05);
}

describe("CasinoVerse accessibility design tokens", () => {
  it("keeps primary and muted editorial copy above WCAG AA contrast", () => {
    const background = rgb("#0d0c0b");
    const ivory = rgb("#f3ecdc");
    expect(contrast(ivory, background)).toBeGreaterThanOrEqual(7);
    expect(contrast(blend(ivory, background, .55), background)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps gold and responsible-entertainment accents readable on their dark surfaces", () => {
    expect(contrast(rgb("#c9a45c"), rgb("#0d0c0b"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(rgb("#9fb8c9"), rgb("#101315"))).toBeGreaterThanOrEqual(4.5);
  });

  it("defines a visible focus indicator for links, buttons, inputs, and custom cards", () => {
    const css = fs.readFileSync(path.resolve(process.cwd(), "client/src/index.css"), "utf8");
    expect(css).toContain(":focus-visible");
    expect(css).toMatch(/a\[href\].*:focus-visible/s);
    expect(css).toContain("outline: 2px solid #ead29b");
    expect(css).toContain(".topic-card");
    expect(css).toContain(".archive-card");
    expect(css).toContain(".source-link");
  });
});
