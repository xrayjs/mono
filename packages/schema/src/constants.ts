/**
 * DTCG Design Tokens Constants
 * W3C Design Tokens Community Group Specification 2025.10
 */

export const COLOR_SPACES = [
  'srgb',
  'display-p3',
  'oklch',
  'oklab',
  'hsl',
  'hwb',
  'lab',
  'lch',
  'xyz',
  'xyz-d50',
  'xyz-d65',
] as const;

export const DIMENSION_UNITS = ['px', 'rem'] as const;

export const DURATION_UNITS = ['ms', 's'] as const;

export const FONT_WEIGHT_KEYWORDS = [
  'thin',
  'hairline',
  'extra-light',
  'ultra-light',
  'light',
  'normal',
  'regular',
  'book',
  'medium',
  'semi-bold',
  'demi-bold',
  'bold',
  'extra-bold',
  'ultra-bold',
  'black',
  'heavy',
  'extra-black',
  'ultra-black',
] as const;

export const BORDER_STYLES = [
  'solid',
  'dashed',
  'dotted',
  'double',
  'groove',
  'ridge',
  'outset',
  'inset',
  'none',
] as const;

export const LINE_CAPS = ['round', 'butt', 'square'] as const;

export const TOKEN_TYPES = [
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'duration',
  'cubicBezier',
  'number',
  'typography',
  'shadow',
  'border',
  'gradient',
  'transition',
  'strokeStyle',
] as const;

// Type exports
export type ColorSpace = (typeof COLOR_SPACES)[number];
export type DimensionUnit = (typeof DIMENSION_UNITS)[number];
export type DurationUnit = (typeof DURATION_UNITS)[number];
export type FontWeightKeyword = (typeof FONT_WEIGHT_KEYWORDS)[number];
export type BorderStyle = (typeof BORDER_STYLES)[number];
export type LineCap = (typeof LINE_CAPS)[number];
export type TokenType = (typeof TOKEN_TYPES)[number];
