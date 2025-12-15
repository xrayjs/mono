import type { ColorValue, ColorSpace } from "@xray/schema";

/**
 * Convert a DTCG color value to a CSS color string
 */
export function colorToCss(value: ColorValue): string {
  const { colorSpace, components, alpha } = value;
  const a = alpha ?? 1;

  // Handle "none" values in components - ensure we have at least 3 components
  const c0 = components[0] === "none" ? 0 : (components[0] ?? 0);
  const c1 = components[1] === "none" ? 0 : (components[1] ?? 0);
  const c2 = components[2] === "none" ? 0 : (components[2] ?? 0);

  switch (colorSpace) {
    case "srgb":
      // sRGB components are 0-1, convert to 0-255 for rgb()
      return `rgb(${Math.round(c0 * 255)} ${Math.round(c1 * 255)} ${Math.round(c2 * 255)} / ${a})`;

    case "display-p3":
      return `color(display-p3 ${c0} ${c1} ${c2} / ${a})`;

    case "hsl":
      // HSL: h (0-360), s (0-100), l (0-100)
      return `hsl(${c0} ${c1}% ${c2}% / ${a})`;

    case "hwb":
      // HWB: h (0-360), w (0-100), b (0-100)
      return `hwb(${c0} ${c1}% ${c2}% / ${a})`;

    case "lab":
      // Lab: L (0-100), a (-125 to 125), b (-125 to 125)
      return `lab(${c0}% ${c1} ${c2} / ${a})`;

    case "lch":
      // LCH: L (0-100), C (0-150), H (0-360)
      return `lch(${c0}% ${c1} ${c2} / ${a})`;

    case "oklab":
      // OKLab: L (0-1), a (-0.4 to 0.4), b (-0.4 to 0.4)
      return `oklab(${c0} ${c1} ${c2} / ${a})`;

    case "oklch":
      // OKLCH: L (0-1), C (0-0.4), H (0-360)
      return `oklch(${c0} ${c1} ${c2} / ${a})`;

    case "xyz":
    case "xyz-d50":
    case "xyz-d65":
      return `color(${colorSpace} ${c0} ${c1} ${c2} / ${a})`;

    default:
      // Fallback to sRGB interpretation
      return `rgb(${Math.round(c0 * 255)} ${Math.round(c1 * 255)} ${Math.round(c2 * 255)} / ${a})`;
  }
}

/**
 * Convert sRGB components (0-1) to hex string
 */
export function srgbToHex(
  components: (number | "none")[],
  alpha?: number
): string {
  const c0 = components[0] === "none" ? 0 : (components[0] ?? 0);
  const c1 = components[1] === "none" ? 0 : (components[1] ?? 0);
  const c2 = components[2] === "none" ? 0 : (components[2] ?? 0);

  const r = Math.round(c0 * 255);
  const g = Math.round(c1 * 255);
  const b = Math.round(c2 * 255);

  const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

  if (alpha !== undefined && alpha < 1) {
    const a = Math.round(alpha * 255);
    return `${hex}${a.toString(16).padStart(2, "0")}`;
  }

  return hex;
}

/**
 * Get a human-readable label for a color space
 */
export function colorSpaceLabel(colorSpace: ColorSpace): string {
  const labels: Record<ColorSpace, string> = {
    srgb: "sRGB",
    "display-p3": "Display P3",
    hsl: "HSL",
    hwb: "HWB",
    lab: "Lab",
    lch: "LCH",
    oklab: "OKLab",
    oklch: "OKLCH",
    xyz: "XYZ",
    "xyz-d50": "XYZ D50",
    "xyz-d65": "XYZ D65",
  };
  return labels[colorSpace] || colorSpace;
}

/**
 * Get component labels for a color space
 */
export function componentLabels(
  colorSpace: ColorSpace
): [string, string, string] {
  switch (colorSpace) {
    case "hsl":
      return ["H", "S", "L"];
    case "hwb":
      return ["H", "W", "B"];
    case "lab":
    case "oklab":
      return ["L", "a", "b"];
    case "lch":
    case "oklch":
      return ["L", "C", "H"];
    case "xyz":
    case "xyz-d50":
    case "xyz-d65":
      return ["X", "Y", "Z"];
    default:
      return ["R", "G", "B"];
  }
}

/**
 * Format a component value for display
 */
export function formatComponent(
  value: number | "none",
  colorSpace: ColorSpace,
  index: number
): string {
  if (value === "none") return "none";

  switch (colorSpace) {
    case "srgb":
    case "display-p3":
      // Show as 0-255 range for RGB
      return Math.round(value * 255).toString();

    case "hsl":
    case "hwb":
      // H is degrees, S/L/W/B are percentages
      if (index === 0) return Math.round(value).toString();
      return `${Math.round(value)}%`;

    case "lab":
    case "lch":
      // L is percentage, others are raw
      if (index === 0) return `${Math.round(value)}%`;
      return value.toFixed(1);

    case "oklab":
    case "oklch":
      // All values are decimals
      return value.toFixed(3);

    default:
      return value.toFixed(2);
  }
}

/**
 * Check if a color is light (for determining text contrast)
 */
export function isLightColor(value: ColorValue): boolean {
  const { colorSpace, components } = value;

  // For sRGB, use relative luminance
  if (colorSpace === "srgb") {
    const r = components[0] === "none" ? 0 : (components[0] ?? 0);
    const g = components[1] === "none" ? 0 : (components[1] ?? 0);
    const b = components[2] === "none" ? 0 : (components[2] ?? 0);
    // Simplified luminance calculation
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 0.5;
  }

  // For OKLCH/OKLab, L > 0.5 is light
  if (colorSpace === "oklch" || colorSpace === "oklab") {
    const l = components[0] === "none" ? 0 : (components[0] ?? 0);
    return l > 0.5;
  }

  // For HSL, L > 50 is light
  if (colorSpace === "hsl") {
    const l = components[2] === "none" ? 0 : (components[2] ?? 0);
    return l > 50;
  }

  // Default to assuming light
  return true;
}
