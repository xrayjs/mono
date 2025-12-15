# DTCG Validator Use Cases

## Overview

The validator provides comprehensive validation for W3C Design Tokens Community Group (DTCG) specification. Here are practical use cases to implement.

---

## Use Cases

### 1. CLI Validation Tool

A command-line tool that validates token files and reports errors.

```bash
dtcg-validate tokens.json
dtcg-validate --watch src/tokens/
```

**Features:**

- Validate single files or directories
- Watch mode for development
- Exit codes for CI integration
- Colored output with error locations

---

### 2. Build-Time Validation Plugin

Integrate validation into build tools (Vite, Webpack, esbuild).

```ts
// vite.config.ts
import { dtcgValidator } from "dtcg-validator/vite";

export default {
  plugins: [dtcgValidator({ tokensDir: "./tokens" })],
};
```

**Features:**

- Fail builds on invalid tokens
- Hot reload support
- Source maps for error locations

---

### 3. Token Linter / Pre-commit Hook

Lint tokens before committing to enforce conventions.

```bash
# .husky/pre-commit
npx dtcg-lint src/tokens/
```

**Features:**

- Custom rules (naming conventions, required descriptions)
- Auto-fix for common issues
- Integration with lint-staged

---

### 4. Design Tool Sync Validation

Validate tokens exported from Figma/Tokens Studio before importing.

```ts
const result = validateTokenFile(figmaExport);
if (!result.valid) {
  notifyDesigner(result.errors);
  return;
}
syncToCodebase(figmaExport);
```

**Features:**

- Validate before sync
- Report issues back to design tool
- Transform/fix common export issues

---

### 5. Token Documentation Generator

Generate documentation from validated tokens.

```ts
const result = validateTokenFile(tokens);
const docs = generateDocs({
  tokens: result.tokens,
  groups: result.groups,
  includeDeprecated: true,
});
```

**Features:**

- List all tokens with types and descriptions
- Show deprecation warnings
- Visualize token hierarchy
- Generate color swatches, spacing scales

---

### 6. Token Reference Graph Analyzer

Analyze token dependencies and detect issues.

```ts
const analyzer = new TokenAnalyzer(tokens);
analyzer.findUnusedTokens();
analyzer.findDeepReferences((maxDepth: 5));
analyzer.findCircularDependencies();
analyzer.visualizeDependencyGraph();
```

**Features:**

- Unused token detection
- Reference depth analysis
- Circular dependency visualization
- Impact analysis (what breaks if I change X?)

---

### 7. Multi-File Token Resolver

Resolve references across multiple token files.

```ts
const resolver = new TokenResolver();
resolver.addFile("base.tokens.json", baseTokens);
resolver.addFile("theme.tokens.json", themeTokens);
const resolved = resolver.resolveAll();
```

**Features:**

- Cross-file reference resolution
- Merge multiple token files
- Detect cross-file circular dependencies
- Theme/mode switching support

---

### 8. Token Migration Tool

Migrate tokens between formats or versions.

```ts
const migrator = new TokenMigrator(oldTokens);
migrator.renameTokens({ "colors.primary": "color.brand.primary" });
migrator.updateReferences();
migrator.validateResult();
```

**Features:**

- Rename tokens with reference updates
- Convert between formats (Style Dictionary <-> DTCG)
- Version migration (DTCG spec versions)
- Dry-run mode

---

### 9. VS Code / IDE Extension

Real-time validation in the editor.

**Features:**

- Inline error diagnostics
- Autocomplete for references
- Hover info for token values
- Go to definition for references
- Color/dimension previews

---

### 10. Token Testing Framework

Unit test tokens like code.

```ts
describe("Brand Tokens", () => {
  it("should have all required color tokens", () => {
    expectTokens(tokens).toHaveToken("colors.primary");
    expectTokens(tokens).toHaveToken("colors.secondary");
  });

  it("should have valid contrast ratios", () => {
    expectTokens(tokens).toHaveContrastRatio(
      "colors.text",
      "colors.background",
      4.5
    );
  });
});
```

**Features:**

- Token existence assertions
- Type assertions
- Accessibility checks (contrast, touch targets)
- Snapshot testing for token values

---

## Recommended Implementation Order

| Priority | Use Case                      | Rationale                         |
| -------- | ----------------------------- | --------------------------------- |
| 1        | CLI Tool                      | Most immediate value, easy to add |
| 2        | VS Code Extension             | High developer experience impact  |
| 3        | Token Documentation Generator | Useful for design systems         |
| 4        | Multi-File Token Resolver     | Needed for real-world projects    |
| 5        | Build Plugin (Vite)           | CI/CD integration                 |
| 6        | Token Testing Framework       | Quality assurance                 |
| 7        | Reference Graph Analyzer      | Advanced debugging                |
| 8        | Migration Tool                | Adoption helper                   |
| 9        | Design Tool Sync              | Depends on specific tools         |
| 10       | Pre-commit Hook               | Simple wrapper around CLI         |
