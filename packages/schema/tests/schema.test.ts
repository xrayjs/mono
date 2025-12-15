import { describe, it, expect } from "vitest";
import {
  // Constants
  COLOR_SPACES,
  DIMENSION_UNITS,
  DURATION_UNITS,
  FONT_WEIGHT_KEYWORDS,
  BORDER_STYLES,
  LINE_CAPS,
  TOKEN_TYPES,

  // Reference schemas
  TokenNameSchema,
  CurlyBraceReferenceSchema,
  JsonPointerReferenceSchema,

  // Value schemas - primitives
  ColorValueSchema,
  ColorComponentSchema,
  DimensionValueSchema,
  FontFamilyValueSchema,
  FontWeightValueSchema,
  DurationValueSchema,
  CubicBezierValueSchema,
  NumberValueSchema,

  // Value schemas - composites
  TypographyValueSchema,
  ShadowValueSchema,
  ShadowOrArraySchema,
  BorderValueSchema,
  GradientStopSchema,
  GradientValueSchema,
  TransitionValueSchema,
  StrokeStyleValueSchema,

  // Token schemas
  BaseTokenSchema,
  TokenTypeSchema,
  TokenFileSchema,
  ExtensionsSchema,
  DeprecatedSchema,
} from "../src/";

// =============================================================================
// Constants Tests
// =============================================================================

describe("Constants", () => {
  it("should have valid color spaces", () => {
    expect(COLOR_SPACES).toContain("srgb");
    expect(COLOR_SPACES).toContain("oklch");
    expect(COLOR_SPACES).toContain("display-p3");
    expect(COLOR_SPACES.length).toBe(11);
  });

  it("should have valid dimension units", () => {
    expect(DIMENSION_UNITS).toEqual(["px", "rem"]);
  });

  it("should have valid duration units", () => {
    expect(DURATION_UNITS).toEqual(["ms", "s"]);
  });

  it("should have valid font weight keywords", () => {
    expect(FONT_WEIGHT_KEYWORDS).toContain("normal");
    expect(FONT_WEIGHT_KEYWORDS).toContain("bold");
    expect(FONT_WEIGHT_KEYWORDS).toContain("thin");
  });

  it("should have valid border styles", () => {
    expect(BORDER_STYLES).toContain("solid");
    expect(BORDER_STYLES).toContain("dashed");
    expect(BORDER_STYLES).toContain("none");
  });

  it("should have valid line caps", () => {
    expect(LINE_CAPS).toEqual(["round", "butt", "square"]);
  });

  it("should have all token types", () => {
    expect(TOKEN_TYPES).toContain("color");
    expect(TOKEN_TYPES).toContain("dimension");
    expect(TOKEN_TYPES).toContain("typography");
    expect(TOKEN_TYPES).toContain("shadow");
    expect(TOKEN_TYPES.length).toBe(13);
  });
});

// =============================================================================
// Token Name Schema Tests
// =============================================================================

describe("TokenNameSchema", () => {
  it("should accept valid token names", () => {
    expect(TokenNameSchema.safeParse("primary").success).toBe(true);
    expect(TokenNameSchema.safeParse("color-primary").success).toBe(true);
    expect(TokenNameSchema.safeParse("spacing-4").success).toBe(true);
    expect(TokenNameSchema.safeParse("my_token").success).toBe(true);
  });

  it("should reject names starting with $", () => {
    expect(TokenNameSchema.safeParse("$value").success).toBe(false);
    expect(TokenNameSchema.safeParse("$type").success).toBe(false);
  });

  it("should reject names containing {, }, or .", () => {
    expect(TokenNameSchema.safeParse("token{name}").success).toBe(false);
    expect(TokenNameSchema.safeParse("token.name").success).toBe(false);
    expect(TokenNameSchema.safeParse("token}name").success).toBe(false);
  });

  it("should reject empty names", () => {
    expect(TokenNameSchema.safeParse("").success).toBe(false);
  });
});

// =============================================================================
// Reference Schema Tests
// =============================================================================

describe("CurlyBraceReferenceSchema", () => {
  it("should accept valid curly brace references", () => {
    expect(CurlyBraceReferenceSchema.safeParse("{color.primary}").success).toBe(
      true
    );
    expect(CurlyBraceReferenceSchema.safeParse("{spacing.4}").success).toBe(
      true
    );
    expect(CurlyBraceReferenceSchema.safeParse("{base}").success).toBe(true);
  });

  it("should reject invalid references", () => {
    expect(CurlyBraceReferenceSchema.safeParse("color.primary").success).toBe(
      false
    );
    expect(CurlyBraceReferenceSchema.safeParse("{color.primary").success).toBe(
      false
    );
    expect(CurlyBraceReferenceSchema.safeParse("color.primary}").success).toBe(
      false
    );
    expect(CurlyBraceReferenceSchema.safeParse("{}").success).toBe(false);
  });

  it("should reject references with $ in path segments", () => {
    expect(CurlyBraceReferenceSchema.safeParse("{$value}").success).toBe(false);
    expect(
      CurlyBraceReferenceSchema.safeParse("{colors.$primary}").success
    ).toBe(false);
  });

  it("should reject references with empty path segments", () => {
    expect(
      CurlyBraceReferenceSchema.safeParse("{colors..primary}").success
    ).toBe(false);
    expect(CurlyBraceReferenceSchema.safeParse("{.primary}").success).toBe(
      false
    );
  });
});

describe("JsonPointerReferenceSchema", () => {
  it("should accept valid JSON pointer references", () => {
    expect(
      JsonPointerReferenceSchema.safeParse({ $ref: "#/color/primary" }).success
    ).toBe(true);
    expect(
      JsonPointerReferenceSchema.safeParse({ $ref: "#/spacing/4" }).success
    ).toBe(true);
    expect(JsonPointerReferenceSchema.safeParse({ $ref: "#/" }).success).toBe(
      true
    );
  });

  it("should reject invalid JSON pointer references", () => {
    expect(
      JsonPointerReferenceSchema.safeParse({ $ref: "/color/primary" }).success
    ).toBe(false);
    expect(
      JsonPointerReferenceSchema.safeParse({ $ref: "color/primary" }).success
    ).toBe(false);
    expect(
      JsonPointerReferenceSchema.safeParse({ ref: "#/color" }).success
    ).toBe(false);
  });
});

// =============================================================================
// Color Value Schema Tests
// =============================================================================

describe("ColorValueSchema", () => {
  it("should accept valid sRGB color", () => {
    const result = ColorValueSchema.safeParse({
      colorSpace: "srgb",
      components: [1, 0.5, 0.25],
    });
    expect(result.success).toBe(true);
  });

  it("should accept color with alpha", () => {
    const result = ColorValueSchema.safeParse({
      colorSpace: "srgb",
      components: [1, 0.5, 0.25],
      alpha: 0.8,
    });
    expect(result.success).toBe(true);
  });

  it("should accept color with hex fallback", () => {
    const result = ColorValueSchema.safeParse({
      colorSpace: "srgb",
      components: [1, 0.5, 0.25],
      hex: "#ff8040",
    });
    expect(result.success).toBe(true);
  });

  it('should accept "none" as component value', () => {
    const result = ColorValueSchema.safeParse({
      colorSpace: "oklch",
      components: [0.7, "none", 180],
    });
    expect(result.success).toBe(true);
  });

  it("should accept display-p3 color space", () => {
    const result = ColorValueSchema.safeParse({
      colorSpace: "display-p3",
      components: [1, 0.5, 0.25],
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid color space", () => {
    const result = ColorValueSchema.safeParse({
      colorSpace: "invalid",
      components: [1, 0.5, 0.25],
    });
    expect(result.success).toBe(false);
  });

  it("should reject components with fewer than 3 values", () => {
    const result = ColorValueSchema.safeParse({
      colorSpace: "srgb",
      components: [1, 0.5],
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid alpha values", () => {
    const result = ColorValueSchema.safeParse({
      colorSpace: "srgb",
      components: [1, 0.5, 0.25],
      alpha: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid hex format", () => {
    const result = ColorValueSchema.safeParse({
      colorSpace: "srgb",
      components: [1, 0.5, 0.25],
      hex: "ff8040",
    });
    expect(result.success).toBe(false);
  });
});

describe("ColorComponentSchema", () => {
  it("should accept numbers", () => {
    expect(ColorComponentSchema.safeParse(0.5).success).toBe(true);
    expect(ColorComponentSchema.safeParse(1).success).toBe(true);
    expect(ColorComponentSchema.safeParse(-0.5).success).toBe(true);
  });

  it('should accept "none"', () => {
    expect(ColorComponentSchema.safeParse("none").success).toBe(true);
  });

  it("should reject other strings", () => {
    expect(ColorComponentSchema.safeParse("auto").success).toBe(false);
    expect(ColorComponentSchema.safeParse("inherit").success).toBe(false);
  });
});

// =============================================================================
// Dimension Value Schema Tests
// =============================================================================

describe("DimensionValueSchema", () => {
  it("should accept valid px dimension", () => {
    const result = DimensionValueSchema.safeParse({ value: 16, unit: "px" });
    expect(result.success).toBe(true);
  });

  it("should accept valid rem dimension", () => {
    const result = DimensionValueSchema.safeParse({ value: 1.5, unit: "rem" });
    expect(result.success).toBe(true);
  });

  it("should accept zero dimension", () => {
    const result = DimensionValueSchema.safeParse({ value: 0, unit: "px" });
    expect(result.success).toBe(true);
  });

  it("should accept negative dimension", () => {
    const result = DimensionValueSchema.safeParse({ value: -10, unit: "px" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid unit", () => {
    const result = DimensionValueSchema.safeParse({ value: 16, unit: "em" });
    expect(result.success).toBe(false);
  });

  it("should reject missing value", () => {
    const result = DimensionValueSchema.safeParse({ unit: "px" });
    expect(result.success).toBe(false);
  });

  it("should reject missing unit", () => {
    const result = DimensionValueSchema.safeParse({ value: 16 });
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// Font Family Value Schema Tests
// =============================================================================

describe("FontFamilyValueSchema", () => {
  it("should accept single font family string", () => {
    expect(FontFamilyValueSchema.safeParse("Inter").success).toBe(true);
    expect(FontFamilyValueSchema.safeParse("Helvetica Neue").success).toBe(
      true
    );
  });

  it("should accept array of font families", () => {
    const result = FontFamilyValueSchema.safeParse([
      "Inter",
      "Helvetica",
      "sans-serif",
    ]);
    expect(result.success).toBe(true);
  });

  it("should reject empty string", () => {
    expect(FontFamilyValueSchema.safeParse("").success).toBe(false);
  });

  it("should reject empty array", () => {
    expect(FontFamilyValueSchema.safeParse([]).success).toBe(false);
  });

  it("should reject array with empty string", () => {
    expect(FontFamilyValueSchema.safeParse(["Inter", ""]).success).toBe(false);
  });
});

// =============================================================================
// Font Weight Value Schema Tests
// =============================================================================

describe("FontWeightValueSchema", () => {
  it("should accept numeric font weight", () => {
    expect(FontWeightValueSchema.safeParse(400).success).toBe(true);
    expect(FontWeightValueSchema.safeParse(700).success).toBe(true);
    expect(FontWeightValueSchema.safeParse(1).success).toBe(true);
    expect(FontWeightValueSchema.safeParse(1000).success).toBe(true);
  });

  it("should accept keyword font weight", () => {
    expect(FontWeightValueSchema.safeParse("normal").success).toBe(true);
    expect(FontWeightValueSchema.safeParse("bold").success).toBe(true);
    expect(FontWeightValueSchema.safeParse("light").success).toBe(true);
  });

  it("should reject numeric weight outside 1-1000 range", () => {
    expect(FontWeightValueSchema.safeParse(0).success).toBe(false);
    expect(FontWeightValueSchema.safeParse(1001).success).toBe(false);
  });

  it("should reject invalid keyword", () => {
    expect(FontWeightValueSchema.safeParse("bolder").success).toBe(false);
    expect(FontWeightValueSchema.safeParse("lighter").success).toBe(false);
  });

  it("should reject non-integer numeric weight", () => {
    expect(FontWeightValueSchema.safeParse(400.5).success).toBe(false);
  });
});

// =============================================================================
// Duration Value Schema Tests
// =============================================================================

describe("DurationValueSchema", () => {
  it("should accept valid ms duration", () => {
    const result = DurationValueSchema.safeParse({ value: 200, unit: "ms" });
    expect(result.success).toBe(true);
  });

  it("should accept valid s duration", () => {
    const result = DurationValueSchema.safeParse({ value: 0.5, unit: "s" });
    expect(result.success).toBe(true);
  });

  it("should accept zero duration", () => {
    const result = DurationValueSchema.safeParse({ value: 0, unit: "ms" });
    expect(result.success).toBe(true);
  });

  it("should reject negative duration", () => {
    const result = DurationValueSchema.safeParse({ value: -100, unit: "ms" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid unit", () => {
    const result = DurationValueSchema.safeParse({ value: 200, unit: "min" });
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// Cubic Bezier Value Schema Tests
// =============================================================================

describe("CubicBezierValueSchema", () => {
  it("should accept valid cubic bezier", () => {
    const result = CubicBezierValueSchema.safeParse([0.25, 0.1, 0.25, 1]);
    expect(result.success).toBe(true);
  });

  it("should accept ease-in-out values", () => {
    const result = CubicBezierValueSchema.safeParse([0.42, 0, 0.58, 1]);
    expect(result.success).toBe(true);
  });

  it("should accept P1y and P2y outside 0-1 range", () => {
    const result = CubicBezierValueSchema.safeParse([0.25, -0.5, 0.25, 1.5]);
    expect(result.success).toBe(true);
  });

  it("should reject P1x outside 0-1 range", () => {
    const result = CubicBezierValueSchema.safeParse([-0.1, 0.1, 0.25, 1]);
    expect(result.success).toBe(false);
  });

  it("should reject P2x outside 0-1 range", () => {
    const result = CubicBezierValueSchema.safeParse([0.25, 0.1, 1.1, 1]);
    expect(result.success).toBe(false);
  });

  it("should reject arrays with wrong length", () => {
    expect(CubicBezierValueSchema.safeParse([0.25, 0.1, 0.25]).success).toBe(
      false
    );
    expect(
      CubicBezierValueSchema.safeParse([0.25, 0.1, 0.25, 1, 0]).success
    ).toBe(false);
  });
});

// =============================================================================
// Number Value Schema Tests
// =============================================================================

describe("NumberValueSchema", () => {
  it("should accept integers", () => {
    expect(NumberValueSchema.safeParse(42).success).toBe(true);
  });

  it("should accept floats", () => {
    expect(NumberValueSchema.safeParse(3.14).success).toBe(true);
  });

  it("should accept negative numbers", () => {
    expect(NumberValueSchema.safeParse(-10).success).toBe(true);
  });

  it("should accept zero", () => {
    expect(NumberValueSchema.safeParse(0).success).toBe(true);
  });

  it("should reject strings", () => {
    expect(NumberValueSchema.safeParse("42").success).toBe(false);
  });
});

// =============================================================================
// Typography Value Schema Tests
// =============================================================================

describe("TypographyValueSchema", () => {
  it("should accept valid typography with required fields", () => {
    const result = TypographyValueSchema.safeParse({
      fontFamily: "Inter",
      fontSize: { value: 16, unit: "px" },
    });
    expect(result.success).toBe(true);
  });

  it("should accept typography with all fields", () => {
    const result = TypographyValueSchema.safeParse({
      fontFamily: ["Inter", "sans-serif"],
      fontSize: { value: 1, unit: "rem" },
      fontWeight: 700,
      letterSpacing: { value: 0.5, unit: "px" },
      lineHeight: 1.5,
    });
    expect(result.success).toBe(true);
  });

  it("should accept references in fields", () => {
    const result = TypographyValueSchema.safeParse({
      fontFamily: "{fonts.body}",
      fontSize: "{size.body}",
      fontWeight: "{weight.bold}",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing fontFamily", () => {
    const result = TypographyValueSchema.safeParse({
      fontSize: { value: 16, unit: "px" },
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing fontSize", () => {
    const result = TypographyValueSchema.safeParse({
      fontFamily: "Inter",
    });
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// Shadow Value Schema Tests
// =============================================================================

describe("ShadowValueSchema", () => {
  it("should accept valid shadow", () => {
    const result = ShadowValueSchema.safeParse({
      color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.25 },
      offsetX: { value: 0, unit: "px" },
      offsetY: { value: 4, unit: "px" },
      blur: { value: 8, unit: "px" },
    });
    expect(result.success).toBe(true);
  });

  it("should accept shadow with spread and inset", () => {
    const result = ShadowValueSchema.safeParse({
      color: { colorSpace: "srgb", components: [0, 0, 0] },
      offsetX: { value: 0, unit: "px" },
      offsetY: { value: 4, unit: "px" },
      blur: { value: 8, unit: "px" },
      spread: { value: 2, unit: "px" },
      inset: true,
    });
    expect(result.success).toBe(true);
  });

  it("should accept shadow with references", () => {
    const result = ShadowValueSchema.safeParse({
      color: "{colors.shadow}",
      offsetX: "{shadow.offsetX}",
      offsetY: "{shadow.offsetY}",
      blur: "{shadow.blur}",
    });
    expect(result.success).toBe(true);
  });

  it("should reject shadow missing required fields", () => {
    const result = ShadowValueSchema.safeParse({
      color: { colorSpace: "srgb", components: [0, 0, 0] },
      offsetX: { value: 0, unit: "px" },
    });
    expect(result.success).toBe(false);
  });
});

describe("ShadowOrArraySchema", () => {
  it("should accept single shadow", () => {
    const result = ShadowOrArraySchema.safeParse({
      color: { colorSpace: "srgb", components: [0, 0, 0] },
      offsetX: { value: 0, unit: "px" },
      offsetY: { value: 4, unit: "px" },
      blur: { value: 8, unit: "px" },
    });
    expect(result.success).toBe(true);
  });

  it("should accept array of shadows", () => {
    const result = ShadowOrArraySchema.safeParse([
      {
        color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.1 },
        offsetX: { value: 0, unit: "px" },
        offsetY: { value: 2, unit: "px" },
        blur: { value: 4, unit: "px" },
      },
      {
        color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.2 },
        offsetX: { value: 0, unit: "px" },
        offsetY: { value: 8, unit: "px" },
        blur: { value: 16, unit: "px" },
      },
    ]);
    expect(result.success).toBe(true);
  });

  it("should reject empty array", () => {
    const result = ShadowOrArraySchema.safeParse([]);
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// Border Value Schema Tests
// =============================================================================

describe("BorderValueSchema", () => {
  it("should accept valid border", () => {
    const result = BorderValueSchema.safeParse({
      color: { colorSpace: "srgb", components: [0, 0, 0] },
      width: { value: 1, unit: "px" },
      style: "solid",
    });
    expect(result.success).toBe(true);
  });

  it("should accept border with references", () => {
    const result = BorderValueSchema.safeParse({
      color: "{colors.border}",
      width: "{border.width}",
      style: "{border.style}",
    });
    expect(result.success).toBe(true);
  });

  it("should accept all border styles", () => {
    for (const style of BORDER_STYLES) {
      const result = BorderValueSchema.safeParse({
        color: { colorSpace: "srgb", components: [0, 0, 0] },
        width: { value: 1, unit: "px" },
        style,
      });
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid border style", () => {
    const result = BorderValueSchema.safeParse({
      color: { colorSpace: "srgb", components: [0, 0, 0] },
      width: { value: 1, unit: "px" },
      style: "wavy",
    });
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// Gradient Value Schema Tests
// =============================================================================

describe("GradientStopSchema", () => {
  it("should accept valid gradient stop", () => {
    const result = GradientStopSchema.safeParse({
      color: { colorSpace: "srgb", components: [1, 0, 0] },
      position: 0,
    });
    expect(result.success).toBe(true);
  });

  it("should accept stop with reference color", () => {
    const result = GradientStopSchema.safeParse({
      color: "{colors.primary}",
      position: 0.5,
    });
    expect(result.success).toBe(true);
  });

  it("should reject position outside 0-1 range", () => {
    const result = GradientStopSchema.safeParse({
      color: { colorSpace: "srgb", components: [1, 0, 0] },
      position: 1.5,
    });
    expect(result.success).toBe(false);
  });
});

describe("GradientValueSchema", () => {
  it("should accept valid gradient with 2 stops", () => {
    const result = GradientValueSchema.safeParse([
      { color: { colorSpace: "srgb", components: [1, 0, 0] }, position: 0 },
      { color: { colorSpace: "srgb", components: [0, 0, 1] }, position: 1 },
    ]);
    expect(result.success).toBe(true);
  });

  it("should accept gradient with multiple stops", () => {
    const result = GradientValueSchema.safeParse([
      { color: { colorSpace: "srgb", components: [1, 0, 0] }, position: 0 },
      { color: { colorSpace: "srgb", components: [0, 1, 0] }, position: 0.5 },
      { color: { colorSpace: "srgb", components: [0, 0, 1] }, position: 1 },
    ]);
    expect(result.success).toBe(true);
  });

  it("should reject gradient with only 1 stop", () => {
    const result = GradientValueSchema.safeParse([
      { color: { colorSpace: "srgb", components: [1, 0, 0] }, position: 0 },
    ]);
    expect(result.success).toBe(false);
  });

  it("should reject empty gradient", () => {
    const result = GradientValueSchema.safeParse([]);
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// Transition Value Schema Tests
// =============================================================================

describe("TransitionValueSchema", () => {
  it("should accept valid transition with duration only", () => {
    const result = TransitionValueSchema.safeParse({
      duration: { value: 200, unit: "ms" },
    });
    expect(result.success).toBe(true);
  });

  it("should accept transition with all properties", () => {
    const result = TransitionValueSchema.safeParse({
      duration: { value: 200, unit: "ms" },
      delay: { value: 50, unit: "ms" },
      timingFunction: [0.25, 0.1, 0.25, 1],
    });
    expect(result.success).toBe(true);
  });

  it("should accept transition with references", () => {
    const result = TransitionValueSchema.safeParse({
      duration: "{duration.fast}",
      delay: "{duration.delay}",
      timingFunction: "{easing.easeOut}",
    });
    expect(result.success).toBe(true);
  });

  it("should reject transition without duration", () => {
    const result = TransitionValueSchema.safeParse({
      delay: { value: 50, unit: "ms" },
    });
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// Stroke Style Value Schema Tests
// =============================================================================

describe("StrokeStyleValueSchema", () => {
  it("should accept simple stroke style keyword", () => {
    expect(StrokeStyleValueSchema.safeParse("solid").success).toBe(true);
    expect(StrokeStyleValueSchema.safeParse("dashed").success).toBe(true);
    expect(StrokeStyleValueSchema.safeParse("dotted").success).toBe(true);
  });

  it("should accept detailed stroke style object", () => {
    const result = StrokeStyleValueSchema.safeParse({
      dashArray: [
        { value: 5, unit: "px" },
        { value: 10, unit: "px" },
      ],
      lineCap: "round",
    });
    expect(result.success).toBe(true);
  });

  it("should accept stroke style object with references", () => {
    const result = StrokeStyleValueSchema.safeParse({
      dashArray: ["{stroke.dash1}", "{stroke.dash2}"],
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty dashArray", () => {
    const result = StrokeStyleValueSchema.safeParse({
      dashArray: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid lineCap", () => {
    const result = StrokeStyleValueSchema.safeParse({
      dashArray: [{ value: 5, unit: "px" }],
      lineCap: "bevel",
    });
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// Token Type Schema Tests
// =============================================================================

describe("TokenTypeSchema", () => {
  it("should accept all valid token types", () => {
    for (const type of TOKEN_TYPES) {
      expect(TokenTypeSchema.safeParse(type).success).toBe(true);
    }
  });

  it("should reject invalid token types", () => {
    expect(TokenTypeSchema.safeParse("invalid").success).toBe(false);
    expect(TokenTypeSchema.safeParse("string").success).toBe(false);
    expect(TokenTypeSchema.safeParse("boolean").success).toBe(false);
  });
});

// =============================================================================
// Extensions Schema Tests
// =============================================================================

describe("ExtensionsSchema", () => {
  it("should accept valid reverse domain notation keys", () => {
    const result = ExtensionsSchema.safeParse({
      "com.example.property": "value",
      "org.company.setting": { nested: true },
    });
    expect(result.success).toBe(true);
  });

  it("should reject keys not in reverse domain notation", () => {
    const result = ExtensionsSchema.safeParse({
      invalid: "value",
    });
    expect(result.success).toBe(false);
  });

  it("should accept empty extensions object", () => {
    const result = ExtensionsSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// Deprecated Schema Tests
// =============================================================================

describe("DeprecatedSchema", () => {
  it("should accept boolean true", () => {
    expect(DeprecatedSchema.safeParse(true).success).toBe(true);
  });

  it("should accept boolean false", () => {
    expect(DeprecatedSchema.safeParse(false).success).toBe(true);
  });

  it("should accept string reason", () => {
    expect(DeprecatedSchema.safeParse("Use newToken instead").success).toBe(
      true
    );
  });

  it("should reject numbers", () => {
    expect(DeprecatedSchema.safeParse(1).success).toBe(false);
  });
});

// =============================================================================
// Base Token Schema Tests
// =============================================================================

describe("BaseTokenSchema", () => {
  it("should accept token with just $value", () => {
    const result = BaseTokenSchema.safeParse({
      $value: { value: 16, unit: "px" },
    });
    expect(result.success).toBe(true);
  });

  it("should accept token with all properties", () => {
    const result = BaseTokenSchema.safeParse({
      $value: { colorSpace: "srgb", components: [1, 0, 0] },
      $type: "color",
      $description: "Primary brand color",
      $deprecated: "Use primary-500 instead",
      $extensions: { "com.example.mode": "light" },
    });
    expect(result.success).toBe(true);
  });

  it("should accept reference as $value", () => {
    const result = BaseTokenSchema.safeParse({
      $value: "{colors.primary}",
    });
    expect(result.success).toBe(true);
  });

  it("should accept JSON pointer reference as $value", () => {
    const result = BaseTokenSchema.safeParse({
      $value: { $ref: "#/colors/primary" },
    });
    expect(result.success).toBe(true);
  });

  it("should reject token without $value", () => {
    const result = BaseTokenSchema.safeParse({
      $type: "color",
    });
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// Token File Schema Tests
// =============================================================================

describe("TokenFileSchema", () => {
  it("should accept valid token file with flat tokens", () => {
    const result = TokenFileSchema.safeParse({
      primary: {
        $value: { colorSpace: "srgb", components: [0.2, 0.4, 1] },
        $type: "color",
      },
      spacing: {
        $value: { value: 16, unit: "px" },
        $type: "dimension",
      },
    });
    expect(result.success).toBe(true);
  });

  it("should accept nested groups", () => {
    const result = TokenFileSchema.safeParse({
      colors: {
        $type: "color",
        primary: {
          $value: { colorSpace: "srgb", components: [0.2, 0.4, 1] },
        },
        secondary: {
          $value: { colorSpace: "srgb", components: [0.8, 0.2, 0.4] },
        },
      },
    });
    expect(result.success).toBe(true);
  });

  it("should accept deeply nested structure", () => {
    const result = TokenFileSchema.safeParse({
      brand: {
        colors: {
          primary: {
            base: {
              $value: { colorSpace: "srgb", components: [0.2, 0.4, 1] },
              $type: "color",
            },
          },
        },
      },
    });
    expect(result.success).toBe(true);
  });

  it("should accept groups with $description", () => {
    const result = TokenFileSchema.safeParse({
      colors: {
        $description: "Brand color palette",
        primary: {
          $value: { colorSpace: "srgb", components: [0.2, 0.4, 1] },
          $type: "color",
        },
      },
    });
    expect(result.success).toBe(true);
  });

  it("should accept tokens with references", () => {
    const result = TokenFileSchema.safeParse({
      base: {
        $value: { colorSpace: "srgb", components: [0.2, 0.4, 1] },
        $type: "color",
      },
      primary: {
        $value: "{base}",
        $type: "color",
      },
    });
    expect(result.success).toBe(true);
  });

  it("should accept empty file", () => {
    const result = TokenFileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject invalid token names with .", () => {
    const result = TokenFileSchema.safeParse({
      "color.primary": {
        $value: { colorSpace: "srgb", components: [1, 0, 0] },
      },
    });
    expect(result.success).toBe(false);
  });

  it("should reject unknown reserved properties", () => {
    const result = TokenFileSchema.safeParse({
      $unknown: "value",
    });
    expect(result.success).toBe(false);
  });
});
