/**
 * DTCG Design Tokens Primitive Value Schemas
 * Basic token value types
 */

import { z } from 'zod';
import {
  COLOR_SPACES,
  DIMENSION_UNITS,
  DURATION_UNITS,
  FONT_WEIGHT_KEYWORDS,
} from './constants.js';

/**
 * Color component - number or "none" keyword
 */
export const ColorComponentSchema = z.union([z.number(), z.literal('none')]);

/**
 * Color value with color space and components
 */
export const ColorValueSchema = z.object({
  colorSpace: z.enum(COLOR_SPACES),
  components: z.array(ColorComponentSchema).min(3).max(4),
  alpha: z.number().min(0).max(1).optional(),
  hex: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/)
    .optional(),
});

/**
 * Dimension value with numeric value and unit
 */
export const DimensionValueSchema = z.object({
  value: z.number(),
  unit: z.enum(DIMENSION_UNITS),
});

/**
 * Font family - single string or array of strings
 */
export const FontFamilyValueSchema = z.union([
  z.string().min(1),
  z.array(z.string().min(1)).min(1),
]);

/**
 * Font weight - numeric (1-1000) or keyword
 */
export const FontWeightValueSchema = z.union([
  z.number().int().min(1).max(1000),
  z.enum(FONT_WEIGHT_KEYWORDS),
]);

/**
 * Duration value with numeric value and unit
 */
export const DurationValueSchema = z.object({
  value: z.number().min(0),
  unit: z.enum(DURATION_UNITS),
});

/**
 * Cubic bezier easing curve - [P1x, P1y, P2x, P2y]
 * P1x and P2x must be between 0 and 1
 */
export const CubicBezierValueSchema = z
  .tuple([z.number(), z.number(), z.number(), z.number()])
  .refine(([p1x, , p2x]) => p1x >= 0 && p1x <= 1 && p2x >= 0 && p2x <= 1, {
    message: 'P1x and P2x values must be between 0 and 1',
  });

/**
 * Number value - plain numeric
 */
export const NumberValueSchema = z.number();

// Type exports
export type ColorValue = z.infer<typeof ColorValueSchema>;
export type DimensionValue = z.infer<typeof DimensionValueSchema>;
export type FontFamilyValue = z.infer<typeof FontFamilyValueSchema>;
export type FontWeightValue = z.infer<typeof FontWeightValueSchema>;
export type DurationValue = z.infer<typeof DurationValueSchema>;
export type CubicBezierValue = z.infer<typeof CubicBezierValueSchema>;
