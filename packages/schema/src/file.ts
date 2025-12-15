/**
 * DTCG Design Tokens File Schema
 * Token file structure and recursive validation
 */

import { z } from 'zod';
import { CurlyBraceReferenceSchema } from './references.js';
import { TokenTypeSchema, AnyTokenValueSchema } from './tokens.js';

/**
 * Known reserved properties
 */
const KNOWN_RESERVED_PROPERTIES = new Set([
  '$value',
  '$type',
  '$description',
  '$deprecated',
  '$extensions',
  '$extends',
  '$root',
  '$schema', // JSON Schema reference (allowed at root level)
]);

/**
 * Check if an object has only valid reserved properties
 */
function validateReservedProperties(obj: Record<string, unknown>): string[] {
  const unknownProps: string[] = [];
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') && !KNOWN_RESERVED_PROPERTIES.has(key)) {
      unknownProps.push(key);
    }
  }
  return unknownProps;
}

/**
 * Validate token names (keys that don't start with $)
 */
function validateTokenNames(obj: Record<string, unknown>): string[] {
  const invalidNames: string[] = [];
  for (const key of Object.keys(obj)) {
    if (!key.startsWith('$') && key !== '$root') {
      if (key.includes('{') || key.includes('}') || key.includes('.')) {
        invalidNames.push(key);
      }
    }
  }
  return invalidNames;
}

/**
 * Token schema (has $value) - for file validation
 */
const TokenSchema = z
  .object({
    $value: AnyTokenValueSchema,
    $type: TokenTypeSchema.optional(),
    $description: z.string().optional(),
    $deprecated: z.union([z.boolean(), z.string()]).optional(),
    $extensions: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

/**
 * Group properties schema (no $value)
 */
const GroupBaseSchema = z.object({
  $type: TokenTypeSchema.optional(),
  $description: z.string().optional(),
  $deprecated: z.union([z.boolean(), z.string()]).optional(),
  $extensions: z.record(z.string(), z.unknown()).optional(),
  $extends: CurlyBraceReferenceSchema.optional(),
  $root: TokenSchema.optional(),
});

/**
 * Recursive node schema - can be a token or a group with nested content
 */
export const TokenFileNodeSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    // Token (has $value)
    TokenSchema,
    // Group (no $value, may have children)
    GroupBaseSchema.catchall(z.lazy(() => TokenFileNodeSchema)),
  ])
);

/**
 * Complete token file schema
 * Allows $schema at root level for JSON Schema references
 */
export const TokenFileSchema = z
  .object({
    $schema: z.string().optional(),
  })
  .catchall(TokenFileNodeSchema)
  .superRefine((obj, ctx) => {
    // Validate at root level
    const unknownProps = validateReservedProperties(obj);
    for (const prop of unknownProps) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unknown reserved property: ${prop}`,
        path: [prop],
      });
    }

    const invalidNames = validateTokenNames(obj);
    for (const name of invalidNames) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid token name: ${name}`,
        path: [name],
      });
    }
  });

// Type exports
export type TokenFile = z.infer<typeof TokenFileSchema>;
