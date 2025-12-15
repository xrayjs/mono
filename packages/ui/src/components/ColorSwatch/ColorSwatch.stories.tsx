import preview from "#storybook/preview";
import { ColorSwatch } from "./ColorSwatch";

const meta = preview.meta({
  title: "Components/ColorSwatch",
  component: ColorSwatch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    color: { control: "text" },
    size: { control: { type: "range", min: 40, max: 200, step: 10 } },
  },
});

// Default example with OKLCH color
export const Default = meta.story({
  args: {
    color: "oklch(70% 0.25 138)",
  },
});

// sRGB gamut colors
export const SRGBColor = meta.story({
  args: {
    color: "rgb(100, 149, 237)",
  },
});

export const HexColor = meta.story({
  args: {
    color: "#ff6b6b",
  },
});

export const HSLColor = meta.story({
  args: {
    color: "hsl(210, 100%, 50%)",
  },
});

// P3 gamut color (outside sRGB)
export const P3Color = meta.story({
  args: {
    color: "color(display-p3 1 0.2 0.1)",
  },
});

// Rec2020 gamut color (outside P3)
export const Rec2020Color = meta.story({
  args: {
    color: "color(rec2020 0.9 0.1 0.1)",
  },
});

// OKLCH with high chroma (likely P3 or wider)
export const OKLCHVibrant = meta.story({
  args: {
    color: "oklch(65% 0.3 29)",
  },
});

// Color with alpha transparency
export const WithAlpha = meta.story({
  args: {
    color: "oklch(70% 0.15 200 / 0.5)",
  },
});

export const HexWithAlpha = meta.story({
  args: {
    color: "#ff6b6b80",
  },
});

// Different sizes
export const SmallSize = meta.story({
  args: {
    color: "oklch(60% 0.2 270)",
    size: 48,
  },
});

export const LargeSize = meta.story({
  args: {
    color: "oklch(80% 0.1 90)",
    size: 120,
  },
});

// Invalid color string
export const InvalidColor = meta.story({
  args: {
    color: "not-a-color",
  },
});

// Named CSS colors
export const NamedColor = meta.story({
  args: {
    color: "rebeccapurple",
  },
});

// Lab color space
export const LabColor = meta.story({
  args: {
    color: "lab(50% 40 60)",
  },
});

// LCH color space
export const LCHColor = meta.story({
  args: {
    color: "lch(60% 80 40)",
  },
});
