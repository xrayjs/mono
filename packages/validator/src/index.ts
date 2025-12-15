/**
 * DTCG Design Tokens Validator Functions
 * Provides validation with detailed error reporting
 */

import { z } from "zod";
import {
  TokenFileSchema,
  TokenTypeSchema,
  TokenValueByType,
  CurlyBraceReferenceSchema,
  JsonPointerReferenceSchema,
  TokenNameSchema,
  type TokenType,
  type Token,
  type TokenFile,
} from "@xray/schema";

// =============================================================================
// Error Types
// =============================================================================

export enum ErrorCode {
  // Syntax
  INVALID_JSON = "E001",
  INVALID_TOKEN_NAME = "E002",

  // Structure
  MISSING_VALUE = "E010",
  UNKNOWN_RESERVED_PROPERTY = "E011",

  // Types
  INVALID_TYPE = "E020",
  TYPE_MISMATCH = "E021",

  // References
  UNRESOLVED_REFERENCE = "E030",
  CIRCULAR_REFERENCE = "E031",
  REFERENCE_TO_GROUP = "E032",

  // Validation
  INVALID_COLOR_SPACE = "E040",
  INVALID_DIMENSION_UNIT = "E041",
  INVALID_FONT_WEIGHT = "E042",
  INVALID_DURATION_UNIT = "E043",
  INVALID_CUBIC_BEZIER = "E044",
  INVALID_GRADIENT = "E045",
  INVALID_BORDER_STYLE = "E046",
}

export interface ValidationError {
  code: ErrorCode;
  message: string;
  path: string[];
  severity: "error" | "warning";
  location?: {
    line: number;
    column: number;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  tokens: Map<string, Token>;
  groups: Set<string>;
}

// =============================================================================
// Validation Context
// =============================================================================

interface ValidationContext {
  errors: ValidationError[];
  warnings: ValidationError[];
  tokens: Map<string, Token>;
  groups: Set<string>;
  inheritedTypes: Map<string, TokenType>;
}

// =============================================================================
// Main Validator Class
// =============================================================================

export class DTCGValidator {
  /**
   * Validate a token file object
   */
  validate(data: unknown): ValidationResult {
    const context: ValidationContext = {
      errors: [],
      warnings: [],
      tokens: new Map(),
      groups: new Set(),
      inheritedTypes: new Map(),
    };

    try {
      // First pass: structural validation with Zod
      const parsed = TokenFileSchema.safeParse(data);

      if (!parsed.success) {
        this.convertZodErrors(parsed.error, context);
      }

      // Second pass: semantic validation
      if (typeof data === "object" && data !== null) {
        this.validateNode(
          data as Record<string, unknown>,
          [],
          context,
          undefined
        );
      }

      // Third pass: reference validation
      this.validateReferences(context);
    } catch (error) {
      context.errors.push({
        code: ErrorCode.INVALID_JSON,
        message:
          error instanceof Error ? error.message : "Unknown parsing error",
        path: [],
        severity: "error",
      });
    }

    return {
      valid: context.errors.length === 0,
      errors: context.errors,
      warnings: context.warnings,
      tokens: context.tokens,
      groups: context.groups,
    };
  }

  /**
   * Validate a JSON string
   */
  validateJSON(jsonString: string): ValidationResult {
    try {
      const data = JSON.parse(jsonString);
      return this.validate(data);
    } catch (error) {
      return {
        valid: false,
        errors: [
          {
            code: ErrorCode.INVALID_JSON,
            message: error instanceof Error ? error.message : "Invalid JSON",
            path: [],
            severity: "error",
          },
        ],
        warnings: [],
        tokens: new Map(),
        groups: new Set(),
      };
    }
  }

  /**
   * Validate a single token value against a specific type
   * Returns { success: true, data } | { success: false, error: ZodError }
   */
  validateTokenValue(value: unknown, type: TokenType) {
    const schema = TokenValueByType[type];
    if (!schema) {
      return {
        success: false as const,
        error: new z.ZodError([
          {
            code: "custom",
            message: `Unknown token type: ${type}`,
            path: [],
          },
        ]),
      };
    }
    return schema.safeParse(value);
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  private convertZodErrors(
    zodError: z.ZodError,
    context: ValidationContext
  ): void {
    for (const issue of zodError.issues) {
      const path = issue.path.map(String);
      let code = ErrorCode.TYPE_MISMATCH;
      let severity: "error" | "warning" = "error";

      // Map Zod error codes to our error codes
      if (issue.message.includes("reserved")) {
        code = ErrorCode.UNKNOWN_RESERVED_PROPERTY;
      } else if (issue.message.includes("Invalid token name")) {
        code = ErrorCode.INVALID_TOKEN_NAME;
      } else if (issue.message.includes("$value")) {
        code = ErrorCode.MISSING_VALUE;
      }

      context.errors.push({
        code,
        message: issue.message,
        path,
        severity,
      });
    }
  }

  private validateNode(
    node: Record<string, unknown>,
    path: string[],
    context: ValidationContext,
    inheritedType: TokenType | undefined
  ): void {
    // Check for $type at current level
    let currentType = inheritedType;
    if ("$type" in node) {
      const typeResult = TokenTypeSchema.safeParse(node.$type);
      if (typeResult.success) {
        currentType = typeResult.data;
        context.inheritedTypes.set(path.join("."), currentType);
      } else {
        context.errors.push({
          code: ErrorCode.INVALID_TYPE,
          message: `Invalid $type value: ${node.$type}`,
          path: [...path, "$type"],
          severity: "error",
        });
      }
    }

    // Check for unknown $ properties
    for (const key of Object.keys(node)) {
      if (key.startsWith("$") && !this.isKnownReservedProperty(key)) {
        context.errors.push({
          code: ErrorCode.UNKNOWN_RESERVED_PROPERTY,
          message: `Unknown reserved property: ${key}`,
          path: [...path, key],
          severity: "error",
        });
      }
    }

    // Is this a token or a group?
    if ("$value" in node) {
      // This is a token
      const tokenPath = path.join(".");
      context.tokens.set(tokenPath, node as unknown as Token);

      // Validate token name
      const tokenName = path[path.length - 1];
      if (tokenName) {
        const nameResult = TokenNameSchema.safeParse(tokenName);
        if (!nameResult.success) {
          context.errors.push({
            code: ErrorCode.INVALID_TOKEN_NAME,
            message: `Invalid token name: ${tokenName}`,
            path,
            severity: "error",
          });
        }
      }

      // Validate $value against $type
      this.validateTokenValueType(node.$value, currentType, path, context);

      // Check for deprecation
      if (node.$deprecated) {
        context.warnings.push({
          code: ErrorCode.TYPE_MISMATCH, // Using as general warning
          message:
            typeof node.$deprecated === "string"
              ? `Deprecated: ${node.$deprecated}`
              : "This token is deprecated",
          path,
          severity: "warning",
        });
      }
    } else {
      // This is a group
      const groupPath = path.join(".");
      if (groupPath) {
        context.groups.add(groupPath);
      }

      // Recursively validate children
      for (const [key, value] of Object.entries(node)) {
        if (key.startsWith("$")) continue; // Skip reserved properties

        if (typeof value === "object" && value !== null) {
          // Validate key as token name (unless it's $root)
          if (key !== "$root") {
            const nameResult = TokenNameSchema.safeParse(key);
            if (!nameResult.success) {
              context.errors.push({
                code: ErrorCode.INVALID_TOKEN_NAME,
                message: `Invalid name: ${key}`,
                path: [...path, key],
                severity: "error",
              });
            }
          }

          this.validateNode(
            value as Record<string, unknown>,
            [...path, key],
            context,
            currentType
          );
        }
      }
    }
  }

  private validateTokenValueType(
    value: unknown,
    type: TokenType | undefined,
    path: string[],
    context: ValidationContext
  ): void {
    // If value is a reference, validate reference format
    if (typeof value === "string") {
      const refResult = CurlyBraceReferenceSchema.safeParse(value);
      if (!refResult.success) {
        context.errors.push({
          code: ErrorCode.TYPE_MISMATCH,
          message: "Invalid token value or reference format",
          path: [...path, "$value"],
          severity: "error",
        });
      }
      return;
    }

    if (typeof value === "object" && value !== null && "$ref" in value) {
      const refResult = JsonPointerReferenceSchema.safeParse(value);
      if (!refResult.success) {
        context.errors.push({
          code: ErrorCode.TYPE_MISMATCH,
          message: "Invalid JSON Pointer reference format",
          path: [...path, "$value"],
          severity: "error",
        });
      }
      return;
    }

    // If we have a type, validate value against it
    if (type) {
      const schema = TokenValueByType[type];
      if (schema) {
        const result = schema.safeParse(value);
        if (!result.success) {
          for (const issue of result.error.issues) {
            context.errors.push({
              code: this.getErrorCodeForType(type),
              message: issue.message,
              path: [...path, "$value", ...issue.path.map(String)],
              severity: "error",
            });
          }
        }
      }
    }
  }

  private validateReferences(context: ValidationContext): void {
    const visited = new Set<string>();
    const inStack = new Set<string>();

    const resolveRef = (ref: string, fromPath: string): void => {
      if (inStack.has(ref)) {
        context.errors.push({
          code: ErrorCode.CIRCULAR_REFERENCE,
          message: `Circular reference detected: ${ref}`,
          path: fromPath.split("."),
          severity: "error",
        });
        return;
      }

      if (visited.has(ref)) return;

      visited.add(ref);
      inStack.add(ref);

      // Check if reference points to a token
      const refPath = ref.replace(/^\{|\}$/g, "");
      if (!context.tokens.has(refPath)) {
        // Check if it points to a group (invalid)
        if (context.groups.has(refPath)) {
          context.errors.push({
            code: ErrorCode.REFERENCE_TO_GROUP,
            message: `Reference points to group, not token: ${ref}`,
            path: fromPath.split("."),
            severity: "error",
          });
        } else {
          context.errors.push({
            code: ErrorCode.UNRESOLVED_REFERENCE,
            message: `Unresolved reference: ${ref}`,
            path: fromPath.split("."),
            severity: "error",
          });
        }
      } else {
        // Check if referenced token also has a reference
        const targetToken = context.tokens.get(refPath);
        if (targetToken && typeof targetToken.$value === "string") {
          const nestedRef = targetToken.$value;
          if (nestedRef.startsWith("{") && nestedRef.endsWith("}")) {
            resolveRef(nestedRef, refPath);
          }
        }
      }

      inStack.delete(ref);
    };

    // Check all token references
    for (const [tokenPath, token] of context.tokens) {
      if (typeof token.$value === "string") {
        const value = token.$value;
        if (value.startsWith("{") && value.endsWith("}")) {
          resolveRef(value, tokenPath);
        }
      }
    }
  }

  private isKnownReservedProperty(key: string): boolean {
    return [
      "$value",
      "$type",
      "$description",
      "$deprecated",
      "$extensions",
      "$extends",
      "$root",
      "$schema", // JSON Schema reference (allowed at root level)
    ].includes(key);
  }

  private getErrorCodeForType(type: TokenType): ErrorCode {
    const typeToCode: Record<TokenType, ErrorCode> = {
      color: ErrorCode.INVALID_COLOR_SPACE,
      dimension: ErrorCode.INVALID_DIMENSION_UNIT,
      fontFamily: ErrorCode.TYPE_MISMATCH,
      fontWeight: ErrorCode.INVALID_FONT_WEIGHT,
      duration: ErrorCode.INVALID_DURATION_UNIT,
      cubicBezier: ErrorCode.INVALID_CUBIC_BEZIER,
      number: ErrorCode.TYPE_MISMATCH,
      typography: ErrorCode.TYPE_MISMATCH,
      shadow: ErrorCode.TYPE_MISMATCH,
      border: ErrorCode.INVALID_BORDER_STYLE,
      gradient: ErrorCode.INVALID_GRADIENT,
      transition: ErrorCode.TYPE_MISMATCH,
      strokeStyle: ErrorCode.INVALID_BORDER_STYLE,
    };
    return typeToCode[type] || ErrorCode.TYPE_MISMATCH;
  }
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Validate a token file object
 */
export function validateTokenFile(data: unknown): ValidationResult {
  const validator = new DTCGValidator();
  return validator.validate(data);
}

/**
 * Validate a JSON string
 */
export function validateTokenJSON(jsonString: string): ValidationResult {
  const validator = new DTCGValidator();
  return validator.validateJSON(jsonString);
}

/**
 * Quick validation - returns true/false
 */
export function isValidTokenFile(data: unknown): boolean {
  return validateTokenFile(data).valid;
}

/**
 * Parse and validate - throws on error
 */
export function parseTokenFile(data: unknown): TokenFile {
  const result = validateTokenFile(data);
  if (!result.valid) {
    const errorMessages = result.errors.map(
      (e) => `[${e.code}] ${e.path.join(".")}: ${e.message}`
    );
    throw new Error(`Invalid token file:\n${errorMessages.join("\n")}`);
  }
  return data as TokenFile;
}
