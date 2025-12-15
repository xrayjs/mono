/**
 * DTCG Design Tokens Token Schemas
 * Individual token definitions and metadata
 */

import { z } from 'zod';
import { TOKEN_TYPES } from './constants.js';
import { CurlyBraceReferenceSchema, JsonPointerReferenceSchema } from './references.js';
import {
  ColorValueSchema,
  DimensionValueSchema,
  FontFamilyValueSchema,
  FontWeightValueSchema,
  DurationValueSchema,
  CubicBezierValueSchema,
  NumberValueSchema,
} from './primitives.js';
import {
  TypographyValueSchema,
  ShadowOrArraySchema,
  BorderValueSchema,
  GradientValueSchema,
  TransitionValueSchema,
  StrokeStyleValueSchema,
} from './composites.js';

/**
 * Token type schema
 */
export const TokenTypeSchema = z.enum(TOKEN_TYPES);

/**
 * Extensions object - vendor-specific using reverse domain notation
 */
export const ExtensionsSchema = z.record(
  z.string().regex(/^[a-z]+\.[a-z]+(\.[a-z0-9-]+)*$/i, {
    message: 'Extension keys must use reverse domain notation (e.g., com.vendor.key)',
  }),
  z.unknown()
);

/**
 * $deprecated - boolean or string reason
 */
export const DeprecatedSchema = z.union([z.boolean(), z.string()]);

/**
 * All possible token values (without references at top level)
 */
export const TokenValueByType = {
  color: ColorValueSchema,
  dimension: DimensionValueSchema,
  fontFamily: FontFamilyValueSchema,
  fontWeight: FontWeightValueSchema,
  duration: DurationValueSchema,
  cubicBezier: CubicBezierValueSchema,
  number: NumberValueSchema,
  typography: TypographyValueSchema,
  shadow: ShadowOrArraySchema,
  border: BorderValueSchema,
  gradient: GradientValueSchema,
  transition: TransitionValueSchema,
  strokeStyle: StrokeStyleValueSchema,
} as const;

/**
 * Any token value (union of all types) or a reference
 */
export const AnyTokenValueSchema = z.union([
  ColorValueSchema,
  DimensionValueSchema,
  FontFamilyValueSchema,
  FontWeightValueSchema,
  DurationValueSchema,
  CubicBezierValueSchema,
  NumberValueSchema,
  TypographyValueSchema,
  ShadowOrArraySchema,
  BorderValueSchema,
  GradientValueSchema,
  TransitionValueSchema,
  StrokeStyleValueSchema,
  CurlyBraceReferenceSchema,
  JsonPointerReferenceSchema,
]);

/**
 * Base token schema with all reserved properties
 */
export const BaseTokenSchema = z.object({
  $value: AnyTokenValueSchema,
  $type: TokenTypeSchema.optional(),
  $description: z.string().optional(),
  $deprecated: DeprecatedSchema.optional(),
  $extensions: ExtensionsSchema.optional(),
});

/**
 * Create a typed token schema for a specific type
 */
export function createTypedTokenSchema<T extends keyof typeof TokenValueByType>(type: T) {
  const valueSchema = TokenValueByType[type];
  return z.object({
    $value: z.union([valueSchema, CurlyBraceReferenceSchema, JsonPointerReferenceSchema]),
    $type: z.literal(type).optional(),
    $description: z.string().optional(),
    $deprecated: DeprecatedSchema.optional(),
    $extensions: ExtensionsSchema.optional(),
  });
}

// Typed token schemas for each type
export const ColorTokenSchema = createTypedTokenSchema('color');
export const DimensionTokenSchema = createTypedTokenSchema('dimension');
export const FontFamilyTokenSchema = createTypedTokenSchema('fontFamily');
export const FontWeightTokenSchema = createTypedTokenSchema('fontWeight');
export const DurationTokenSchema = createTypedTokenSchema('duration');
export const CubicBezierTokenSchema = createTypedTokenSchema('cubicBezier');
export const NumberTokenSchema = createTypedTokenSchema('number');
export const TypographyTokenSchema = createTypedTokenSchema('typography');
export const ShadowTokenSchema = createTypedTokenSchema('shadow');
export const BorderTokenSchema = createTypedTokenSchema('border');
export const GradientTokenSchema = createTypedTokenSchema('gradient');
export const TransitionTokenSchema = createTypedTokenSchema('transition');
export const StrokeStyleTokenSchema = createTypedTokenSchema('strokeStyle');

/**
 * Group properties (no $value)
 */
export const GroupPropertiesSchema = z.object({
  $type: TokenTypeSchema.optional(),
  $description: z.string().optional(),
  $deprecated: DeprecatedSchema.optional(),
  $extensions: ExtensionsSchema.optional(),
  $extends: CurlyBraceReferenceSchema.optional(),
});

/**
 * Root token schema ($root within groups)
 */
export const RootTokenSchema = BaseTokenSchema;

// Type exports
export type Token = z.infer<typeof BaseTokenSchema>;
