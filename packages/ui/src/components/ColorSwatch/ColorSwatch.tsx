/** @jsxImportSource solid-js */
import {
  mergeProps,
  splitProps,
  createMemo,
  createSignal,
  onMount,
  onCleanup,
  Show,
} from "solid-js";
import Color from "colorjs.io";
import "./ColorSwatch.css";

export interface ColorSwatchProps {
  /** CSS color string (e.g., "oklch(70% 0.25 138)") */
  color: string;
  /** Swatch size in pixels (default: 80) */
  size?: number;
  /** Always show split view with sRGB fallback for colors outside sRGB gamut */
  alwaysShowFallback?: boolean;
  /** Allow native HTML attributes */
  [key: string]: unknown;
}

type DisplayGamut = "srgb" | "p3" | "rec2020";
type ColorGamut = "sRGB" | "P3" | "Rec2020" | "Wide";

/**
 * Determine the gamut a color falls within
 */
function getGamut(color: Color): ColorGamut {
  if (color.inGamut("srgb")) return "sRGB";
  if (color.inGamut("p3")) return "P3";
  if (color.inGamut("rec2020")) return "Rec2020";
  return "Wide";
}

/**
 * Check if a color is light (for determining text contrast)
 */
function isLightColor(color: Color): boolean {
  const oklch = color.to("oklch");
  return oklch.coords[0] > 0.6;
}

/**
 * Detect the display's color gamut capability
 */
function detectDisplayGamut(): DisplayGamut {
  if (typeof window === "undefined") return "srgb";
  if (window.matchMedia("(color-gamut: rec2020)").matches) return "rec2020";
  if (window.matchMedia("(color-gamut: p3)").matches) return "p3";
  return "srgb";
}

/**
 * Check if a color gamut can be displayed on the current display
 */
function canDisplayGamut(
  colorGamut: ColorGamut,
  displayGamut: DisplayGamut
): boolean {
  if (colorGamut === "sRGB") return true;
  if (colorGamut === "P3")
    return displayGamut === "p3" || displayGamut === "rec2020";
  if (colorGamut === "Rec2020") return displayGamut === "rec2020";
  return false; // Wide gamut colors can't be fully displayed
}

/**
 * Get the fallback color (gamut-mapped to sRGB)
 */
function getFallbackColor(color: Color): string {
  const srgb = color.to("srgb");
  srgb.toGamut({ space: "srgb" });
  return srgb.display();
}

/** Display a color swatch with value and gamut information */
export const ColorSwatch = (_props: ColorSwatchProps) => {
  const [props, rest] = splitProps(
    mergeProps({ size: 80, alwaysShowFallback: false }, _props),
    ["color", "size", "alwaysShowFallback"]
  );

  const [displayGamut, setDisplayGamut] = createSignal<DisplayGamut>("srgb");

  onMount(() => {
    setDisplayGamut(detectDisplayGamut());

    // Listen for display changes (e.g., moving window between monitors)
    const p3Query = window.matchMedia("(color-gamut: p3)");
    const rec2020Query = window.matchMedia("(color-gamut: rec2020)");

    const handleChange = () => setDisplayGamut(detectDisplayGamut());

    p3Query.addEventListener("change", handleChange);
    rec2020Query.addEventListener("change", handleChange);

    onCleanup(() => {
      p3Query.removeEventListener("change", handleChange);
      rec2020Query.removeEventListener("change", handleChange);
    });
  });

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

  const fallbackColor = createMemo(() => {
    const color = parsedColor();
    if (!color) return "transparent";
    return getFallbackColor(color);
  });

  const gamut = createMemo((): ColorGamut | "Invalid" => {
    const color = parsedColor();
    if (!color) return "Invalid";
    return getGamut(color);
  });

  const canDisplay = createMemo(() => {
    const g = gamut();
    if (g === "Invalid") return true;
    return canDisplayGamut(g, displayGamut());
  });

  const isOutsideSrgb = createMemo(() => {
    const g = gamut();
    return g === "P3" || g === "Rec2020" || g === "Wide";
  });

  const showSplitView = createMemo(() => {
    if (!isValid()) return false;
    if (props.alwaysShowFallback && isOutsideSrgb()) return true;
    return !canDisplay();
  });

  const unavailableMessage = createMemo(() => {
    // When using alwaysShowFallback on a displayable color, show the gamut name instead
    if (props.alwaysShowFallback && canDisplay()) {
      const g = gamut();
      if (g === "P3") return "P3";
      if (g === "Rec2020") return "Rec2020";
      if (g === "Wide") return "Wide";
    }
    const g = gamut();
    if (g === "P3") return "P3 unavailable";
    if (g === "Rec2020") return "Rec2020 unavailable";
    if (g === "Wide") return "Out of gamut";
    return "";
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
    <div class="color-swatch" style={{ width: `${props.size}px` }} {...rest}>
      <div
        class="color-swatch__swatch"
        classList={{
          "color-swatch__swatch--split": showSplitView(),
        }}
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

        <Show
          when={showSplitView()}
          fallback={
            /* Normal single color view */
            <div
              class="color-swatch__color"
              style={{ "background-color": cssColor() }}
            />
          }
        >
          {/* Split view: left = original (with unavailable overlay), right = fallback */}
          <div class="color-swatch__split-container">
            <div class="color-swatch__split-left">
              <div
                class="color-swatch__color"
                style={{ "background-color": cssColor() }}
              />
              <div class="color-swatch__unavailable">
                <span class="color-swatch__unavailable-text">
                  {unavailableMessage()}
                </span>
              </div>
            </div>
            <div class="color-swatch__split-right">
              <div
                class="color-swatch__color"
                style={{ "background-color": fallbackColor() }}
              />
              <div class="color-swatch__fallback-label">
                <span>sRGB</span>
              </div>
            </div>
          </div>
        </Show>

        {/* Invalid overlay */}
        <Show when={!isValid()}>
          <div class="color-swatch__invalid">
            <span>?</span>
          </div>
        </Show>
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
