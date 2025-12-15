import type { ColorValue } from "@xray/schema";

/**
 * Represents a parsed color token with its path
 */
export interface ColorToken {
  path: string;
  name: string;
  value: ColorValue;
  description?: string;
  deprecated?: boolean | string;
}

/**
 * Represents a group of color tokens
 */
export interface ColorGroup {
  path: string;
  name: string;
  description?: string;
  tokens: ColorToken[];
  groups: ColorGroup[];
}

/**
 * Result of parsing a token file
 */
export interface ParseResult {
  fileName: string;
  colorGroups: ColorGroup[];
  colorTokens: ColorToken[];
  errors: string[];
}

/**
 * Check if a value is a color token value
 */
function isColorValue(value: unknown): value is ColorValue {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.colorSpace === "string" &&
    Array.isArray(obj.components) &&
    obj.components.length >= 3
  );
}

/**
 * Check if an object is a token (has $value property)
 */
function isToken(obj: unknown): obj is { $value: unknown; $description?: string; $deprecated?: boolean | string } {
  if (typeof obj !== "object" || obj === null) return false;
  return "$value" in obj;
}

/**
 * Extract color tokens from a token file recursively
 */
function extractColorTokens(
  obj: Record<string, unknown>,
  parentPath: string = "",
  inheritedType?: string
): { tokens: ColorToken[]; groups: ColorGroup[] } {
  const tokens: ColorToken[] = [];
  const groups: ColorGroup[] = [];

  // Check if this level has $type: "color"
  const currentType = (obj.$type as string) || inheritedType;
  const isColorGroup = currentType === "color";

  for (const [key, value] of Object.entries(obj)) {
    // Skip special properties
    if (key.startsWith("$")) continue;

    const currentPath = parentPath ? `${parentPath}.${key}` : key;

    if (isToken(value)) {
      // This is a token
      const tokenValue = value.$value;

      if (isColorGroup && isColorValue(tokenValue)) {
        tokens.push({
          path: currentPath,
          name: key,
          value: tokenValue,
          description: value.$description as string | undefined,
          deprecated: value.$deprecated as boolean | string | undefined,
        });
      }
    } else if (typeof value === "object" && value !== null) {
      // This is a group - recurse
      const nested = extractColorTokens(
        value as Record<string, unknown>,
        currentPath,
        currentType
      );

      if (nested.tokens.length > 0 || nested.groups.length > 0) {
        groups.push({
          path: currentPath,
          name: key,
          description: (value as Record<string, unknown>).$description as string | undefined,
          tokens: nested.tokens,
          groups: nested.groups,
        });
      }
    }
  }

  return { tokens, groups };
}

/**
 * Flatten all color tokens from groups into a single array
 */
function flattenColorTokens(groups: ColorGroup[]): ColorToken[] {
  const tokens: ColorToken[] = [];

  for (const group of groups) {
    tokens.push(...group.tokens);
    tokens.push(...flattenColorTokens(group.groups));
  }

  return tokens;
}

/**
 * Parse a token file and extract color tokens
 */
export function parseTokenFile(
  content: string,
  fileName: string
): ParseResult {
  const errors: string[] = [];

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    return {
      fileName,
      colorGroups: [],
      colorTokens: [],
      errors: [`Failed to parse JSON: ${e instanceof Error ? e.message : String(e)}`],
    };
  }

  const { tokens: topLevelTokens, groups } = extractColorTokens(parsed);

  // Create a root group for any top-level tokens
  const colorGroups: ColorGroup[] = groups;

  // Flatten all tokens for easy access
  const colorTokens = [...topLevelTokens, ...flattenColorTokens(groups)];

  return {
    fileName,
    colorGroups,
    colorTokens,
    errors,
  };
}

/**
 * Parse tokens from an object (for example tokens)
 */
export function parseTokenObject(
  tokens: Record<string, unknown>,
  fileName: string = "Example"
): ParseResult {
  const { tokens: topLevelTokens, groups } = extractColorTokens(tokens);
  const colorTokens = [...topLevelTokens, ...flattenColorTokens(groups)];

  return {
    fileName,
    colorGroups: groups,
    colorTokens,
    errors: [],
  };
}
