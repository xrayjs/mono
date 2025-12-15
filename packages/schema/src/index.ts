/**
 * DTCG Design Tokens Schemas
 * Re-exports all schema modules
 */

// Constants
export {
  COLOR_SPACES,
  DIMENSION_UNITS,
  DURATION_UNITS,
  FONT_WEIGHT_KEYWORDS,
  BORDER_STYLES,
  LINE_CAPS,
  TOKEN_TYPES,
  type ColorSpace,
  type DimensionUnit,
  type DurationUnit,
  type FontWeightKeyword,
  type BorderStyle,
  type LineCap,
  type TokenType,
} from './constants.js';

// References
export {
  TokenNameSchema,
  CurlyBraceReferenceSchema,
  JsonPointerReferenceSchema,
  ReferenceSchema,
} from './references.js';

// Primitives
export {
  ColorComponentSchema,
  ColorValueSchema,
  DimensionValueSchema,
  FontFamilyValueSchema,
  FontWeightValueSchema,
  DurationValueSchema,
  CubicBezierValueSchema,
  NumberValueSchema,
  type ColorValue,
  type DimensionValue,
  type FontFamilyValue,
  type FontWeightValue,
  type DurationValue,
  type CubicBezierValue,
} from './primitives.js';

// Composites
export {
  TypographyValueSchema,
  ShadowValueSchema,
  ShadowOrArraySchema,
  BorderValueSchema,
  GradientStopSchema,
  GradientValueSchema,
  TransitionValueSchema,
  StrokeStyleValueSchema,
  type TypographyValue,
  type ShadowValue,
  type BorderValue,
  type GradientStop,
  type GradientValue,
  type TransitionValue,
  type StrokeStyleValue,
} from './composites.js';

// Tokens
export {
  TokenTypeSchema,
  ExtensionsSchema,
  DeprecatedSchema,
  TokenValueByType,
  AnyTokenValueSchema,
  BaseTokenSchema,
  createTypedTokenSchema,
  ColorTokenSchema,
  DimensionTokenSchema,
  FontFamilyTokenSchema,
  FontWeightTokenSchema,
  DurationTokenSchema,
  CubicBezierTokenSchema,
  NumberTokenSchema,
  TypographyTokenSchema,
  ShadowTokenSchema,
  BorderTokenSchema,
  GradientTokenSchema,
  TransitionTokenSchema,
  StrokeStyleTokenSchema,
  GroupPropertiesSchema,
  RootTokenSchema,
  type Token,
} from './tokens.js';

// File
export { TokenFileNodeSchema, TokenFileSchema, type TokenFile } from './file.js';
