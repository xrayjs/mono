/**
 * DTCG Design Tokens Reference Schemas
 * Token name and reference validation
 */

import { z } from 'zod';

/**
 * Token names MUST NOT begin with $ or contain {, }, or .
 */
export const TokenNameSchema = z
  .string()
  .min(1)
  .refine((name) => !name.startsWith('$'), {
    message: 'Token name must not begin with $',
  })
  .refine((name) => !/[{}.]/.test(name), {
    message: 'Token name must not contain {, }, or . characters',
  });

/**
 * Curly brace reference syntax: "{path.to.token}"
 */
export const CurlyBraceReferenceSchema = z
  .string()
  .regex(/^\{[^{}]+\}$/, 'Invalid curly brace reference format')
  .refine(
    (ref) => {
      const inner = ref.slice(1, -1);
      const parts = inner.split('.');
      return parts.every((part) => part.length > 0 && !part.startsWith('$'));
    },
    { message: 'Invalid reference path' }
  );

/**
 * JSON Pointer reference syntax: {"$ref": "#/path/to/value"}
 */
export const JsonPointerReferenceSchema = z.object({
  $ref: z
    .string()
    .regex(/^#\/.*$/, 'JSON Pointer must start with #/')
    .refine(
      (pointer) => {
        // RFC 6901 validation - segments separated by /
        const path = pointer.slice(2);
        if (path === '') return true;
        return path.split('/').every((segment) => segment.length > 0);
      },
      { message: 'Invalid JSON Pointer format' }
    ),
});

/**
 * Combined reference schema - either curly brace or JSON pointer
 */
export const ReferenceSchema = z.union([CurlyBraceReferenceSchema, JsonPointerReferenceSchema]);
