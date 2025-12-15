import { describe, it, expect, beforeEach } from "vitest";
import {
  DTCGValidator,
  validateTokenFile,
  validateTokenJSON,
  isValidTokenFile,
  parseTokenFile,
  ErrorCode,
} from "../src";

// =============================================================================
// DTCGValidator Class Tests
// =============================================================================

describe("DTCGValidator", () => {
  let validator: DTCGValidator;

  beforeEach(() => {
    validator = new DTCGValidator();
  });

  describe("validate()", () => {
    it("should return valid result for valid token file", () => {
      const result = validator.validate({
        primary: {
          $value: { colorSpace: "srgb", components: [0.2, 0.4, 1] },
          $type: "color",
        },
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.tokens.size).toBe(1);
      expect(result.tokens.has("primary")).toBe(true);
    });

    it("should collect tokens from nested groups", () => {
      const result = validator.validate({
        colors: {
          $type: "color",
          primary: {
            $value: { colorSpace: "srgb", components: [0.2, 0.4, 1] },
          },
          secondary: {
            $value: { colorSpace: "srgb", components: [0.8, 0.2, 0.4] },
          },
        },
        spacing: {
          small: {
            $value: { value: 8, unit: "px" },
            $type: "dimension",
          },
        },
      });

      expect(result.valid).toBe(true);
      expect(result.tokens.size).toBe(3);
      expect(result.tokens.has("colors.primary")).toBe(true);
      expect(result.tokens.has("colors.secondary")).toBe(true);
      expect(result.tokens.has("spacing.small")).toBe(true);
    });

    it("should collect groups", () => {
      const result = validator.validate({
        colors: {
          $type: "color",
          brand: {
            primary: {
              $value: { colorSpace: "srgb", components: [0.2, 0.4, 1] },
            },
          },
        },
      });

      expect(result.groups.has("colors")).toBe(true);
      expect(result.groups.has("colors.brand")).toBe(true);
    });

    it("should inherit type from parent group", () => {
      const result = validator.validate({
        colors: {
          $type: "color",
          primary: {
            $value: { colorSpace: "srgb", components: [0.2, 0.4, 1] },
          },
        },
      });

      expect(result.valid).toBe(true);
    });

    it("should generate warnings for deprecated tokens", () => {
      const result = validator.validate({
        oldToken: {
          $value: { value: 16, unit: "px" },
          $type: "dimension",
          $deprecated: true,
        },
        oldToken2: {
          $value: { value: 20, unit: "px" },
          $type: "dimension",
          $deprecated: "Use newToken instead",
        },
      });

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBe(2);
      expect(result.warnings[0].message).toContain("deprecated");
    });
  });

  describe("error detection", () => {
    it("should detect invalid token names starting with $", () => {
      const result = validator.validate({
        $invalid: {
          $value: { value: 16, unit: "px" },
        },
      });

      expect(result.valid).toBe(false);
      expect(
        result.errors.some(
          (e) => e.code === ErrorCode.UNKNOWN_RESERVED_PROPERTY
        )
      ).toBe(true);
    });

    it("should detect invalid token names with dots", () => {
      const result = validator.validate({
        "token.name": {
          $value: { value: 16, unit: "px" },
        },
      });

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.code === ErrorCode.INVALID_TOKEN_NAME)
      ).toBe(true);
    });

    it("should detect invalid token names with braces", () => {
      const result = validator.validate({
        "token{name}": {
          $value: { value: 16, unit: "px" },
        },
      });

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.code === ErrorCode.INVALID_TOKEN_NAME)
      ).toBe(true);
    });

    it("should detect unknown reserved properties", () => {
      const result = validator.validate({
        token: {
          $value: { value: 16, unit: "px" },
          $unknown: "something",
        },
      });

      expect(result.valid).toBe(false);
      expect(
        result.errors.some(
          (e) => e.code === ErrorCode.UNKNOWN_RESERVED_PROPERTY
        )
      ).toBe(true);
    });

    it("should detect invalid $type values", () => {
      const result = validator.validate({
        token: {
          $value: { value: 16, unit: "px" },
          $type: "invalid",
        },
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === ErrorCode.INVALID_TYPE)).toBe(
        true
      );
    });

    it("should detect type mismatch", () => {
      const result = validator.validate({
        token: {
          $value: "not a dimension",
          $type: "dimension",
        },
      });

      expect(result.valid).toBe(false);
    });
  });

  describe("reference validation", () => {
    it("should accept valid references", () => {
      const result = validator.validate({
        base: {
          $value: { colorSpace: "srgb", components: [1, 0, 0] },
          $type: "color",
        },
        primary: {
          $value: "{base}",
          $type: "color",
        },
      });

      expect(result.valid).toBe(true);
    });

    it("should detect unresolved references", () => {
      const result = validator.validate({
        primary: {
          $value: "{nonexistent}",
          $type: "color",
        },
      });

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.code === ErrorCode.UNRESOLVED_REFERENCE)
      ).toBe(true);
    });

    it("should detect references to groups", () => {
      const result = validator.validate({
        colors: {
          $type: "color",
          primary: {
            $value: { colorSpace: "srgb", components: [1, 0, 0] },
          },
        },
        alias: {
          $value: "{colors}",
          $type: "color",
        },
      });

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.code === ErrorCode.REFERENCE_TO_GROUP)
      ).toBe(true);
    });

    it("should detect circular references", () => {
      const result = validator.validate({
        tokenA: {
          $value: "{tokenB}",
          $type: "color",
        },
        tokenB: {
          $value: "{tokenA}",
          $type: "color",
        },
      });

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.code === ErrorCode.CIRCULAR_REFERENCE)
      ).toBe(true);
    });

    it("should detect indirect circular references", () => {
      const result = validator.validate({
        tokenA: {
          $value: "{tokenB}",
          $type: "color",
        },
        tokenB: {
          $value: "{tokenC}",
          $type: "color",
        },
        tokenC: {
          $value: "{tokenA}",
          $type: "color",
        },
      });

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.code === ErrorCode.CIRCULAR_REFERENCE)
      ).toBe(true);
    });

    it("should accept chained references without cycles", () => {
      const result = validator.validate({
        base: {
          $value: { colorSpace: "srgb", components: [1, 0, 0] },
          $type: "color",
        },
        primary: {
          $value: "{base}",
          $type: "color",
        },
        accent: {
          $value: "{primary}",
          $type: "color",
        },
      });

      expect(result.valid).toBe(true);
    });
  });

  describe("validateJSON()", () => {
    it("should parse and validate valid JSON", () => {
      const json = JSON.stringify({
        token: {
          $value: { value: 16, unit: "px" },
          $type: "dimension",
        },
      });

      const result = validator.validateJSON(json);
      expect(result.valid).toBe(true);
    });

    it("should detect invalid JSON", () => {
      const result = validator.validateJSON("{ invalid json }");

      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ErrorCode.INVALID_JSON);
    });

    it("should detect empty JSON", () => {
      const result = validator.validateJSON("");

      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe(ErrorCode.INVALID_JSON);
    });
  });

  describe("validateTokenValue()", () => {
    it("should validate color value", () => {
      const result = validator.validateTokenValue(
        { colorSpace: "srgb", components: [1, 0.5, 0.25] },
        "color"
      );
      expect(result.success).toBe(true);
    });

    it("should validate dimension value", () => {
      const result = validator.validateTokenValue(
        { value: 16, unit: "px" },
        "dimension"
      );
      expect(result.success).toBe(true);
    });

    it("should reject invalid dimension value", () => {
      const result = validator.validateTokenValue(
        { value: 16, unit: "em" },
        "dimension"
      );
      expect(result.success).toBe(false);
    });

    it("should validate number value", () => {
      const result = validator.validateTokenValue(42, "number");
      expect(result.success).toBe(true);
    });

    it("should validate fontFamily value", () => {
      const result = validator.validateTokenValue(
        ["Inter", "sans-serif"],
        "fontFamily"
      );
      expect(result.success).toBe(true);
    });

    it("should validate fontWeight value", () => {
      const result = validator.validateTokenValue(700, "fontWeight");
      expect(result.success).toBe(true);
    });

    it("should validate duration value", () => {
      const result = validator.validateTokenValue(
        { value: 200, unit: "ms" },
        "duration"
      );
      expect(result.success).toBe(true);
    });

    it("should validate cubicBezier value", () => {
      const result = validator.validateTokenValue(
        [0.25, 0.1, 0.25, 1],
        "cubicBezier"
      );
      expect(result.success).toBe(true);
    });

    it("should validate typography value", () => {
      const result = validator.validateTokenValue(
        {
          fontFamily: "Inter",
          fontSize: { value: 16, unit: "px" },
        },
        "typography"
      );
      expect(result.success).toBe(true);
    });

    it("should validate shadow value", () => {
      const result = validator.validateTokenValue(
        {
          color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.25 },
          offsetX: { value: 0, unit: "px" },
          offsetY: { value: 4, unit: "px" },
          blur: { value: 8, unit: "px" },
        },
        "shadow"
      );
      expect(result.success).toBe(true);
    });

    it("should validate border value", () => {
      const result = validator.validateTokenValue(
        {
          color: { colorSpace: "srgb", components: [0, 0, 0] },
          width: { value: 1, unit: "px" },
          style: "solid",
        },
        "border"
      );
      expect(result.success).toBe(true);
    });

    it("should validate gradient value", () => {
      const result = validator.validateTokenValue(
        [
          { color: { colorSpace: "srgb", components: [1, 0, 0] }, position: 0 },
          { color: { colorSpace: "srgb", components: [0, 0, 1] }, position: 1 },
        ],
        "gradient"
      );
      expect(result.success).toBe(true);
    });

    it("should validate transition value", () => {
      const result = validator.validateTokenValue(
        {
          duration: { value: 200, unit: "ms" },
          timingFunction: [0.25, 0.1, 0.25, 1],
        },
        "transition"
      );
      expect(result.success).toBe(true);
    });

    it("should validate strokeStyle value", () => {
      const result = validator.validateTokenValue("dashed", "strokeStyle");
      expect(result.success).toBe(true);
    });
  });
});

// =============================================================================
// Convenience Functions Tests
// =============================================================================

describe("validateTokenFile()", () => {
  it("should validate a valid token file", () => {
    const result = validateTokenFile({
      token: {
        $value: { value: 16, unit: "px" },
        $type: "dimension",
      },
    });

    expect(result.valid).toBe(true);
  });

  it("should return errors for invalid token file", () => {
    const result = validateTokenFile({
      token: {
        $value: "invalid",
        $type: "dimension",
      },
    });

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe("validateTokenJSON()", () => {
  it("should validate valid JSON string", () => {
    const json = JSON.stringify({
      token: {
        $value: { value: 16, unit: "px" },
        $type: "dimension",
      },
    });

    const result = validateTokenJSON(json);
    expect(result.valid).toBe(true);
  });

  it("should return error for invalid JSON", () => {
    const result = validateTokenJSON("not json");
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe(ErrorCode.INVALID_JSON);
  });
});

describe("isValidTokenFile()", () => {
  it("should return true for valid token file", () => {
    const valid = isValidTokenFile({
      token: {
        $value: { value: 16, unit: "px" },
        $type: "dimension",
      },
    });

    expect(valid).toBe(true);
  });

  it("should return false for invalid token file", () => {
    const valid = isValidTokenFile({
      $invalid: {
        $value: { value: 16, unit: "px" },
      },
    });

    expect(valid).toBe(false);
  });
});

describe("parseTokenFile()", () => {
  it("should return data for valid token file", () => {
    const data = {
      token: {
        $value: { value: 16, unit: "px" },
        $type: "dimension",
      },
    };

    const result = parseTokenFile(data);
    expect(result).toEqual(data);
  });

  it("should throw for invalid token file", () => {
    expect(() => {
      parseTokenFile({
        $invalid: {
          $value: { value: 16, unit: "px" },
        },
      });
    }).toThrow("Invalid token file");
  });

  it("should include error details in thrown error", () => {
    try {
      parseTokenFile({
        "bad.name": {
          $value: { value: 16, unit: "px" },
        },
      });
      expect.fail("Should have thrown");
    } catch (error) {
      expect((error as Error).message).toContain("Invalid token file");
    }
  });
});

// =============================================================================
// ErrorCode Tests
// =============================================================================

describe("ErrorCode", () => {
  it("should have expected error codes", () => {
    expect(ErrorCode.INVALID_JSON).toBe("E001");
    expect(ErrorCode.INVALID_TOKEN_NAME).toBe("E002");
    expect(ErrorCode.MISSING_VALUE).toBe("E010");
    expect(ErrorCode.UNKNOWN_RESERVED_PROPERTY).toBe("E011");
    expect(ErrorCode.INVALID_TYPE).toBe("E020");
    expect(ErrorCode.TYPE_MISMATCH).toBe("E021");
    expect(ErrorCode.UNRESOLVED_REFERENCE).toBe("E030");
    expect(ErrorCode.CIRCULAR_REFERENCE).toBe("E031");
    expect(ErrorCode.REFERENCE_TO_GROUP).toBe("E032");
  });
});

// =============================================================================
// Edge Cases and Complex Scenarios
// =============================================================================

describe("Edge Cases", () => {
  it("should handle deeply nested token structures", () => {
    const result = validateTokenFile({
      level1: {
        level2: {
          level3: {
            level4: {
              level5: {
                token: {
                  $value: { value: 16, unit: "px" },
                  $type: "dimension",
                },
              },
            },
          },
        },
      },
    });

    expect(result.valid).toBe(true);
    expect(result.tokens.has("level1.level2.level3.level4.level5.token")).toBe(
      true
    );
  });

  it("should handle multiple token types in same file", () => {
    const result = validateTokenFile({
      colors: {
        $type: "color",
        primary: {
          $value: { colorSpace: "srgb", components: [0.2, 0.4, 1] },
        },
      },
      spacing: {
        $type: "dimension",
        small: {
          $value: { value: 8, unit: "px" },
        },
        large: {
          $value: { value: 32, unit: "px" },
        },
      },
      fonts: {
        $type: "fontFamily",
        body: {
          $value: ["Inter", "system-ui", "sans-serif"],
        },
      },
      durations: {
        $type: "duration",
        fast: {
          $value: { value: 100, unit: "ms" },
        },
      },
    });

    expect(result.valid).toBe(true);
    expect(result.tokens.size).toBe(5);
  });

  it("should handle tokens with extensions", () => {
    const result = validateTokenFile({
      token: {
        $value: { colorSpace: "srgb", components: [1, 0, 0] },
        $type: "color",
        $extensions: {
          "com.figma.mode": "light",
          "org.design.system.category": "brand",
        },
      },
    });

    expect(result.valid).toBe(true);
  });

  it("should handle composite tokens with nested references", () => {
    const result = validateTokenFile({
      colors: {
        shadow: {
          $value: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.25 },
          $type: "color",
        },
      },
      dimensions: {
        shadowOffset: {
          $value: { value: 4, unit: "px" },
          $type: "dimension",
        },
        shadowBlur: {
          $value: { value: 8, unit: "px" },
          $type: "dimension",
        },
      },
      shadows: {
        card: {
          $value: {
            color: "{colors.shadow}",
            offsetX: { value: 0, unit: "px" },
            offsetY: "{dimensions.shadowOffset}",
            blur: "{dimensions.shadowBlur}",
          },
          $type: "shadow",
        },
      },
    });

    expect(result.valid).toBe(true);
  });

  it("should handle empty groups", () => {
    const result = validateTokenFile({
      emptyGroup: {
        $description: "This group is intentionally empty",
      },
    });

    expect(result.valid).toBe(true);
    expect(result.groups.has("emptyGroup")).toBe(true);
    expect(result.tokens.size).toBe(0);
  });

  it("should validate complex typography token", () => {
    const result = validateTokenFile({
      typography: {
        heading: {
          h1: {
            $value: {
              fontFamily: ["Inter", "Helvetica Neue", "sans-serif"],
              fontSize: { value: 2.5, unit: "rem" },
              fontWeight: 700,
              letterSpacing: { value: -0.5, unit: "px" },
              lineHeight: 1.2,
            },
            $type: "typography",
          },
        },
      },
    });

    expect(result.valid).toBe(true);
  });

  it("should validate array of shadows", () => {
    const result = validateTokenFile({
      shadows: {
        elevation: {
          $value: [
            {
              color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.1 },
              offsetX: { value: 0, unit: "px" },
              offsetY: { value: 1, unit: "px" },
              blur: { value: 2, unit: "px" },
            },
            {
              color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.15 },
              offsetX: { value: 0, unit: "px" },
              offsetY: { value: 4, unit: "px" },
              blur: { value: 8, unit: "px" },
            },
          ],
          $type: "shadow",
        },
      },
    });

    expect(result.valid).toBe(true);
  });

  it("should handle null input gracefully", () => {
    const result = validateTokenFile(null);
    expect(result.valid).toBe(false);
  });

  it("should handle undefined input gracefully", () => {
    const result = validateTokenFile(undefined);
    expect(result.valid).toBe(false);
  });

  it("should handle array input", () => {
    const result = validateTokenFile([]);
    expect(result.valid).toBe(false);
  });

  it("should handle primitive input", () => {
    const result = validateTokenFile("string");
    expect(result.valid).toBe(false);
  });
});
