/** @jsxImportSource solid-js */
import { mergeProps, splitProps, createMemo } from "solid-js";
import Color from "colorjs.io";
import "./ColorSwatch.css";

export interface ColorSwatchProps {
  /** CSS color string (e.g., "oklch(70% 0.25 138)") */
  color: string;
  /** Swatch size in pixels (default: 80) */
  size?: number;
  /** Allow native HTML attributes */
  [key: string]: unknown;
}

/**
 * Determine the gamut a color falls within
 */
function getGamut(color: Color): string {
  if (color.inGamut("srgb")) return "sRGB";
  if (color.inGamut("p3")) return "P3";
  if (color.inGamut("rec2020")) return "Rec2020";
  return "Wide";
}

/**
 * Check if a color is light (for determining text contrast)
 */
function isLightColor(color: Color): boolean {
  // Convert to oklch and check lightness
  const oklch = color.to("oklch");
  return oklch.coords[0] > 0.6;
}

/** Display a color swatch with value and gamut information */
export const ColorSwatch = (_props: ColorSwatchProps) => {
  const [props, rest] = splitProps(
    mergeProps({ size: 80 }, _props),
    ["color", "size"]
  );

  const parsedColor = createMemo(() => {
    try {
      return new Color(props.color);
    } catch {
      return null;
    }
  });

  const cssColor = createMemo(() => {
    const color = parsedColor();
    if (!color) return "transparent";
    return color.display();
  });

  const gamut = createMemo(() => {
    const color = parsedColor();
    if (!color) return "Invalid";
    return getGamut(color);
  });

  const hasAlpha = createMemo(() => {
    const color = parsedColor();
    if (!color) return false;
    return color.alpha < 1;
  });

  const isLight = createMemo(() => {
    const color = parsedColor();
    if (!color) return true;
    return isLightColor(color);
  });

  const isValid = createMemo(() => parsedColor() !== null);

  return (
    <div
      class="color-swatch"
      style={{ width: `${props.size}px` }}
      {...rest}
    >
      <div
        class="color-swatch__swatch"
        style={{
          width: `${props.size}px`,
          height: `${props.size}px`,
          "border-color": isLight() ? "rgba(0,0,0,0.1)" : "transparent",
        }}
      >
        {/* Checkered background for alpha */}
        <div
          class="color-swatch__alpha-grid"
          style={{
            display: hasAlpha() ? "block" : "none",
          }}
        />
        {/* Color layer */}
        <div
          class="color-swatch__color"
          style={{ "background-color": cssColor() }}
        />
        {/* Invalid overlay */}
        {!isValid() && (
          <div class="color-swatch__invalid">
            <span>?</span>
          </div>
        )}
      </div>
      <div class="color-swatch__info">
        <span class="color-swatch__value" title={props.color}>
          {props.color}
        </span>
        <span
          class="color-swatch__gamut"
          classList={{
            "color-swatch__gamut--srgb": gamut() === "sRGB",
            "color-swatch__gamut--p3": gamut() === "P3",
            "color-swatch__gamut--rec2020": gamut() === "Rec2020",
            "color-swatch__gamut--wide": gamut() === "Wide",
            "color-swatch__gamut--invalid": gamut() === "Invalid",
          }}
        >
          {gamut()}
        </span>
      </div>
    </div>
  );
};
