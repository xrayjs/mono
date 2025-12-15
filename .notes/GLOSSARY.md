# Design Tokens Glossary

Quick reference for W3C DTCG terminology.

---

## Core Concepts

**Design Token**
An indivisible piece of a design system stored as data. Has a name, value, and type. Example: a color, spacing value, or font size.

**Token File**
A JSON file (`.tokens` or `.tokens.json`) containing design tokens following the DTCG specification.

**Token Name**
The key identifying a token. Must not start with `$` or contain `{`, `}`, `.` characters.

**Token Path**
The dot-separated path to a token including all ancestor groups. Example: `color.semantic.primary`

**Token Value (`$value`)**
The actual data stored in a token. Required property. Can be a primitive, object, or reference.

**Token Type (`$type`)**
Declares what kind of value the token holds. Determines validation rules and translation behavior.

---

## Structural Concepts

**Group**
A JSON object without `$value` that organizes tokens hierarchically. Can contain tokens, nested groups, and group-level properties.

**Root Token (`$root`)**
A special token within a group that represents the group's default value. Referenced as `{group.$root}`.

**Type Inheritance**
Child tokens automatically inherit `$type` from ancestor groups unless they define their own.

**Group Extension (`$extends`)**
Allows a group to inherit properties from another group via deep merge. Local properties override inherited.

---

## Reference System

**Alias/Reference**
A token value that points to another token's value instead of defining its own.

**Curly Brace Syntax**
Reference format: `"{path.to.token}"`. Resolves entire `$value`. Can only target tokens.

**JSON Pointer Syntax**
Reference format: `{"$ref": "#/json/pointer/path"}`. RFC 6901 compliant. Can target any document location.

**Circular Reference**
A reference chain that loops back to itself. Must be detected and rejected.

**Chained Reference**
A reference pointing to another reference. Resolution follows chain to final value.

---

## Token Types

**Simple Type**
A token type with a single, atomic value: `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`.

**Composite Type**
A token type combining multiple sub-values: `typography`, `shadow`, `border`, `gradient`, `transition`, `strokeStyle`.

---

## Type Definitions

| Type          | Description    | Value Format                                      |
| ------------- | -------------- | ------------------------------------------------- |
| `color`       | Color value    | `{colorSpace, components, alpha?, hex?}`          |
| `dimension`   | Size with unit | `{value, unit}`                                   |
| `fontFamily`  | Font name(s)   | `string \| string[]`                              |
| `fontWeight`  | Font weight    | `number \| keyword`                               |
| `duration`    | Time value     | `{value, unit}`                                   |
| `cubicBezier` | Easing curve   | `[x1, y1, x2, y2]`                                |
| `number`      | Plain number   | `number`                                          |
| `typography`  | Text style     | `{fontFamily, fontSize, fontWeight, ...}`         |
| `shadow`      | Drop shadow    | `{color, offsetX, offsetY, blur, spread, inset?}` |
| `border`      | Border style   | `{color, width, style}`                           |
| `gradient`    | Color gradient | `[{color, position}, ...]`                        |
| `transition`  | Animation      | `{duration, delay, timingFunction}`               |
| `strokeStyle` | Stroke pattern | `string \| {dashArray, lineCap}`                  |

---

## Color Concepts

**Color Space**
Mathematical model defining how colors are represented: `srgb`, `display-p3`, `oklch`, etc.

**Components**
Array of numeric values defining a color in its color space (e.g., RGB values, LCH values).

**Alpha**
Opacity value 0-1. Separate from components array.

**None Keyword**
Special value `"none"` for missing/non-applicable color components.

---

## Metadata Properties

**$description**
Human-readable documentation for a token or group. String.

**$deprecated**
Marks token as deprecated. Boolean `true` or string with reason.

**$extensions**
Vendor-specific metadata object. Uses reverse domain notation keys.

---

## Tool Categories

**Parser**
Reads token files and builds internal representation. Validates syntax and structure.

**Validator**
Checks tokens against spec rules. Reports errors and warnings.

**Resolver**
Resolves all references to their final values. Handles circular reference detection.

**Translation Tool**
Converts tokens to platform-specific formats (CSS, Swift, Kotlin, etc.).

**Design Tool Integration**
Syncs tokens with design tools like Figma, Sketch, Adobe XD.

---

## File Conventions

| Item            | Convention                       |
| --------------- | -------------------------------- |
| Extension       | `.tokens` or `.tokens.json`      |
| MIME Type       | `application/design-tokens+json` |
| Encoding        | UTF-8                            |
| Reserved Prefix | `$` (all spec properties)        |

---

## Validation Terminology

**MUST**
Absolute requirement. Violation is an error.

**MUST NOT**
Absolute prohibition. Violation is an error.

**SHOULD**
Recommended but not required. Violation may warn.

**MAY**
Optional behavior. Implementation choice.
