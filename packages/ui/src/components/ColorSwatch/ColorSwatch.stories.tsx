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

// sRGB gamut colors (will always display normally)
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

// P3 gamut colors (will show split view on sRGB displays)
export const P3Color = meta.story({
  args: {
    color: "color(display-p3 1 0.2 0.1)",
  },
  parameters: {
    docs: {
      description: {
        story:
          "A Display P3 color. On sRGB displays, shows split view with sRGB fallback.",
      },
    },
  },
});

export const P3VibrantGreen = meta.story({
  args: {
    color: "color(display-p3 0.2 1 0.2)",
  },
  parameters: {
    docs: {
      description: {
        story: "A vibrant P3 green that exceeds sRGB gamut.",
      },
    },
  },
});

export const P3VibrantCyan = meta.story({
  args: {
    color: "color(display-p3 0 0.9 0.9)",
  },
});

// Rec2020 gamut colors (will show split view on sRGB and P3 displays)
export const Rec2020Color = meta.story({
  args: {
    color: "color(rec2020 0.9 0.1 0.1)",
  },
  parameters: {
    docs: {
      description: {
        story:
          "A Rec2020 color. Shows split view on most displays since Rec2020 is rarely supported.",
      },
    },
  },
});

export const Rec2020Green = meta.story({
  args: {
    color: "color(rec2020 0.3 0.9 0.1)",
  },
});

// OKLCH with high chroma (likely P3 or wider)
export const OKLCHVibrantRed = meta.story({
  args: {
    color: "oklch(65% 0.3 29)",
  },
  parameters: {
    docs: {
      description: {
        story: "High-chroma OKLCH red that likely exceeds sRGB gamut.",
      },
    },
  },
});

export const OKLCHVibrantBlue = meta.story({
  args: {
    color: "oklch(50% 0.35 264)",
  },
});

export const OKLCHVibrantMagenta = meta.story({
  args: {
    color: "oklch(60% 0.32 328)",
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

export const P3WithAlpha = meta.story({
  args: {
    color: "color(display-p3 1 0.3 0.1 / 0.7)",
  },
  parameters: {
    docs: {
      description: {
        story:
          "P3 color with alpha. Split view also works with transparent colors.",
      },
    },
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

export const LargeP3Color = meta.story({
  args: {
    color: "color(display-p3 1 0.5 0)",
    size: 140,
  },
  parameters: {
    docs: {
      description: {
        story: "Larger size makes the split view and labels more readable.",
      },
    },
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

// Wide gamut (outside even Rec2020)
export const WideGamut = meta.story({
  args: {
    color: "oklch(70% 0.5 150)",
  },
  parameters: {
    docs: {
      description: {
        story: "Extremely high chroma color that exceeds even Rec2020 gamut.",
      },
    },
  },
});
