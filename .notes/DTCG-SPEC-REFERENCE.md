# W3C Design Tokens Specification Reference

Version: 2025.10 | Status: Draft Community Group Report

---

## File Format

- Extensions: `.tokens` or `.tokens.json`
- MIME: `application/design-tokens+json`
- Encoding: UTF-8 JSON

---

## Token Structure

```json
{
  "token-name": {
    "$value": <required>,
    "$type": "<type>",
    "$description": "Optional documentation",
    "$deprecated": true | "reason string",
    "$extensions": { "com.vendor.key": <any> }
  }
}
```

### Reserved Properties

All `$`-prefixed properties are spec-reserved. Unknown `$` properties must error.

### Name Restrictions

Token names MUST NOT:

- Begin with `$`
- Contain `{`, `}`, or `.`

---

## Groups

Groups are objects WITHOUT `$value`. They organize tokens hierarchically.

```json
{
  "color": {
    "$type": "color",
    "$description": "Color tokens",
    "primary": { "$value": {...} },
    "secondary": { "$value": {...} }
  }
}
```

### Type Inheritance

Child tokens inherit `$type` from ancestor groups unless overridden.

### Root Token

Groups may contain a root token via reserved name `$root`:

```json
{
  "accent": {
    "$root": { "$type": "color", "$value": {...} },
    "light": { "$type": "color", "$value": {...} },
    "dark": { "$type": "color", "$value": {...} }
  }
}
```

Reference: `{accent.$root}` (NOT `{accent}`)

### Group Extension

```json
{
  "base": { "a": { "$value": 1 }, "b": { "$value": 2 } },
  "extended": {
    "$extends": "{base}",
    "b": { "$value": 3 },
    "c": { "$value": 4 }
  }
}
```

Result: `extended` has `a=1, b=3, c=4` (deep merge, local overrides inherited)

---

## Token Types

### color

```json
{
  "$type": "color",
  "$value": {
    "colorSpace": "srgb",
    "components": [0.2, 0.4, 0.9],
    "alpha": 0.5,
    "hex": "#3366e6"
  }
}
```

- `colorSpace`: `srgb` | `display-p3` | `oklch` | `oklab` | `hsl` | `hwb` | `lab` | `lch` | `xyz` | `xyz-d50` | `xyz-d65`
- `components`: Array of numbers (channel values)
- `alpha`: Optional, 0-1
- `hex`: Optional, for sRGB compatibility
- Components may use `"none"` keyword for missing values

### dimension

```json
{
  "$type": "dimension",
  "$value": { "value": 16, "unit": "px" }
}
```

- `unit`: `px` | `rem`

### fontFamily

```json
{ "$type": "fontFamily", "$value": "Inter" }
{ "$type": "fontFamily", "$value": ["Inter", "Helvetica", "sans-serif"] }
```

### fontWeight

```json
{ "$type": "fontWeight", "$value": 400 }
{ "$type": "fontWeight", "$value": "bold" }
```

- Numeric: 1-1000
- Keywords: `thin` (100), `hairline` (100), `extra-light` (200), `ultra-light` (200), `light` (300), `normal` (400), `regular` (400), `book` (400), `medium` (500), `semi-bold` (600), `demi-bold` (600), `bold` (700), `extra-bold` (800), `ultra-bold` (800), `black` (900), `heavy` (900), `extra-black` (950), `ultra-black` (950)

### duration

```json
{ "$type": "duration", "$value": { "value": 200, "unit": "ms" } }
```

- `unit`: `ms` | `s`

### cubicBezier

```json
{ "$type": "cubicBezier", "$value": [0.4, 0, 0.2, 1] }
```

- Array of 4 numbers: [P1x, P1y, P2x, P2y]
- P1x and P2x must be 0-1

### number

```json
{ "$type": "number", "$value": 1.5 }
```

---

## Composite Types

### typography

```json
{
  "$type": "typography",
  "$value": {
    "fontFamily": "Inter",
    "fontSize": { "value": 16, "unit": "px" },
    "fontWeight": 400,
    "letterSpacing": { "value": 0.5, "unit": "px" },
    "lineHeight": 1.5
  }
}
```

### shadow

```json
{
  "$type": "shadow",
  "$value": {
    "color": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 0.1 },
    "offsetX": { "value": 0, "unit": "px" },
    "offsetY": { "value": 4, "unit": "px" },
    "blur": { "value": 8, "unit": "px" },
    "spread": { "value": 0, "unit": "px" },
    "inset": false
  }
}
```

May be array for multiple shadows: `"$value": [{...}, {...}]`

### border

```json
{
  "$type": "border",
  "$value": {
    "color": { "colorSpace": "srgb", "components": [0.8, 0.8, 0.8] },
    "width": { "value": 1, "unit": "px" },
    "style": "solid"
  }
}
```

- `style`: `solid` | `dashed` | `dotted` | `double` | `groove` | `ridge` | `outset` | `inset` | `none`

### gradient

```json
{
  "$type": "gradient",
  "$value": [
    { "color": { "colorSpace": "srgb", "components": [1, 0, 0] }, "position": 0 },
    { "color": { "colorSpace": "srgb", "components": [0, 0, 1] }, "position": 1 }
  ]
}
```

- `position`: 0-1 (percentage as decimal)

### transition

```json
{
  "$type": "transition",
  "$value": {
    "duration": { "value": 200, "unit": "ms" },
    "delay": { "value": 0, "unit": "ms" },
    "timingFunction": [0.4, 0, 0.2, 1]
  }
}
```

### strokeStyle

```json
{ "$type": "strokeStyle", "$value": "dashed" }
```

Or detailed:

```json
{
  "$type": "strokeStyle",
  "$value": {
    "dashArray": [
      { "value": 4, "unit": "px" },
      { "value": 2, "unit": "px" }
    ],
    "lineCap": "round"
  }
}
```

- Simple: `solid` | `dashed` | `dotted` | `double` | `groove` | `ridge` | `outset` | `inset` | `none`
- `lineCap`: `round` | `butt` | `square`

---

## References (Aliases)

### Curly Brace Syntax

```json
{
  "color": {
    "blue": { "$type": "color", "$value": {...} }
  },
  "semantic": {
    "primary": { "$type": "color", "$value": "{color.blue}" }
  }
}
```

- Resolves entire `$value`
- Can only target tokens (objects with `$value`)
- Supports chaining: `{a}` → `{b}` → actual value

### JSON Pointer Syntax

```json
{
  "base": {
    "blue": {
      "$type": "color",
      "$value": { "colorSpace": "srgb", "components": [0.2, 0.4, 0.9] }
    }
  },
  "derived": {
    "$type": "color",
    "$value": {
      "colorSpace": "srgb",
      "components": [
        { "$ref": "#/base/blue/$value/components/0" },
        { "$ref": "#/base/blue/$value/components/1" },
        0.7
      ]
    }
  }
}
```

- Follows RFC 6901 JSON Pointer
- Can target any location including sub-properties
- Enables property-level references

### Circular Reference Detection

Tools MUST detect and error on circular references before resolution.

---

## Extensions

Vendor-specific data uses reverse domain notation:

```json
{
  "$extensions": {
    "com.figma.variableId": "VariableID:123",
    "org.example.customData": { "key": "value" }
  }
}
```

Tools MUST preserve unknown extensions.

---

## Validation Rules

### MUST Error

- Token without `$value`
- Unknown `$`-prefixed property
- Invalid `$type` value
- Type mismatch between `$type` and `$value`
- Unresolvable reference
- Circular reference
- Invalid token name (contains `$`, `{`, `}`, `.`)
- Reference to group instead of token

### SHOULD Warn

- Deprecated token usage
- Unknown extension namespaces

---

## Implementation Requirements

### Parsers

1. Support both curly brace and JSON Pointer references
2. Implement type inheritance from groups
3. Detect circular references before resolution
4. Preserve reference structure until values needed
5. Validate all reserved property formats

### Translation Tools

1. Use token paths for unique identification
2. Convert types to platform-specific formats
3. Handle color space conversions
4. Preserve extension data
5. Support both resolved and unresolved output modes

### Design Tools

1. Use `$type` for appropriate UI controls
2. Display `$description` as tooltips
3. Show deprecation warnings
4. Support group hierarchy navigation
5. Enable reference creation/management

---

## Example: Complete Token File

```json
{
  "color": {
    "$type": "color",
    "primitive": {
      "blue-500": {
        "$value": { "colorSpace": "srgb", "components": [0.2, 0.4, 0.9] }
      },
      "gray-100": {
        "$value": { "colorSpace": "srgb", "components": [0.96, 0.96, 0.96] }
      }
    },
    "semantic": {
      "background": {
        "primary": { "$value": "{color.primitive.gray-100}" },
        "interactive": { "$value": "{color.primitive.blue-500}" }
      }
    }
  },
  "spacing": {
    "$type": "dimension",
    "xs": { "$value": { "value": 4, "unit": "px" } },
    "sm": { "$value": { "value": 8, "unit": "px" } },
    "md": { "$value": { "value": 16, "unit": "px" } },
    "lg": { "$value": { "value": 24, "unit": "px" } }
  },
  "typography": {
    "$type": "typography",
    "heading": {
      "h1": {
        "$value": {
          "fontFamily": "Inter",
          "fontSize": { "value": 32, "unit": "px" },
          "fontWeight": 700,
          "lineHeight": 1.2
        }
      }
    }
  },
  "shadow": {
    "$type": "shadow",
    "elevation-1": {
      "$value": {
        "color": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 0.1 },
        "offsetX": { "value": 0, "unit": "px" },
        "offsetY": { "value": 2, "unit": "px" },
        "blur": { "value": 4, "unit": "px" },
        "spread": { "value": 0, "unit": "px" }
      }
    }
  }
}
```

---

## References

- Specification: https://www.designtokens.org/TR/2025.10/
- Format Module: https://www.designtokens.org/tr/2025.10/format/
- Color Module: https://www.designtokens.org/tr/2025.10/color/
- GitHub: https://github.com/design-tokens/community-group
- CSS Color Level 4: https://www.w3.org/TR/css-color-4/
