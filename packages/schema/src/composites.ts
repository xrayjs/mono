/**
 * DTCG Design Tokens Composite Value Schemas
 * Complex token value types built from primitives
 */

import { z } from "zod";
import { BORDER_STYLES, LINE_CAPS } from "./constants.js";
import { CurlyBraceReferenceSchema } from "./references.js";
import {
  ColorValueSchema,
  DimensionValueSchema,
  FontFamilyValueSchema,
  FontWeightValueSchema,
  DurationValueSchema,
  CubicBezierValueSchema,
} from "./primitives.js";

/**
 * Typography composite value
 */
export const TypographyValueSchema = z.object({
  fontFamily: z.union([FontFamilyValueSchema, CurlyBraceReferenceSchema]),
  fontSize: z.union([DimensionValueSchema, CurlyBraceReferenceSchema]),
  fontWeight: z
    .union([FontWeightValueSchema, CurlyBraceReferenceSchema])
    .optional(),
  letterSpacing: z
    .union([DimensionValueSchema, CurlyBraceReferenceSchema])
    .optional(),
  lineHeight: z.union([z.number(), CurlyBraceReferenceSchema]).optional(),
});

/**
 * Shadow composite value
 */
export const ShadowValueSchema = z.object({
  color: z.union([ColorValueSchema, CurlyBraceReferenceSchema]),
  offsetX: z.union([DimensionValueSchema, CurlyBraceReferenceSchema]),
  offsetY: z.union([DimensionValueSchema, CurlyBraceReferenceSchema]),
  blur: z.union([DimensionValueSchema, CurlyBraceReferenceSchema]),
  spread: z.union([DimensionValueSchema, CurlyBraceReferenceSchema]).optional(),
  inset: z.boolean().optional(),
});

/**
 * Shadow can be single or array of shadows
 */
export const ShadowOrArraySchema = z.union([
  ShadowValueSchema,
  z.array(ShadowValueSchema).min(1),
]);

/**
 * Border composite value
 */
export const BorderValueSchema = z.object({
  color: z.union([ColorValueSchema, CurlyBraceReferenceSchema]),
  width: z.union([DimensionValueSchema, CurlyBraceReferenceSchema]),
  style: z.union([z.enum(BORDER_STYLES), CurlyBraceReferenceSchema]),
});

/**
 * Gradient stop
 */
export const GradientStopSchema = z.object({
  color: z.union([ColorValueSchema, CurlyBraceReferenceSchema]),
  position: z.number().min(0).max(1),
});

/**
 * Gradient composite value - array of stops
 */
export const GradientValueSchema = z.array(GradientStopSchema).min(2);

/**
 * Transition composite value
 */
export const TransitionValueSchema = z.object({
  duration: z.union([DurationValueSchema, CurlyBraceReferenceSchema]),
  delay: z.union([DurationValueSchema, CurlyBraceReferenceSchema]).optional(),
  timingFunction: z
    .union([CubicBezierValueSchema, CurlyBraceReferenceSchema])
    .optional(),
});

/**
 * Stroke style - simple keyword or detailed object
 */
export const StrokeStyleValueSchema = z.union([
  z.enum(BORDER_STYLES),
  z.object({
    dashArray: z
      .array(z.union([DimensionValueSchema, CurlyBraceReferenceSchema]))
      .min(1),
    lineCap: z.enum(LINE_CAPS).optional(),
  }),
]);

// Type exports
export type TypographyValue = z.infer<typeof TypographyValueSchema>;
export type ShadowValue = z.infer<typeof ShadowValueSchema>;
export type BorderValue = z.infer<typeof BorderValueSchema>;
export type GradientStop = z.infer<typeof GradientStopSchema>;
export type GradientValue = z.infer<typeof GradientValueSchema>;
export type TransitionValue = z.infer<typeof TransitionValueSchema>;
export type StrokeStyleValue = z.infer<typeof StrokeStyleValueSchema>;
