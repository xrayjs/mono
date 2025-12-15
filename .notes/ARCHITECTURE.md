# Design Tokens Toolkit - Architecture Guide

Implementation architecture for a W3C DTCG-compliant toolkit.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Token Sources                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  .tokens │  │  Figma   │  │  Sketch  │  │   API    │        │
│  │   files  │  │  Plugin  │  │  Plugin  │  │  Import  │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
└───────┼─────────────┼─────────────┼─────────────┼──────────────┘
        │             │             │             │
        └─────────────┴──────┬──────┴─────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Core Engine                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                        Parser                             │  │
│  │  • JSON parsing  • Syntax validation  • Tree building     │  │
│  └────────────────────────────┬─────────────────────────────┘  │
│                               ▼                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                       Validator                           │  │
│  │  • Type checking  • Reference validation  • Schema rules  │  │
│  └────────────────────────────┬─────────────────────────────┘  │
│                               ▼                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                       Resolver                            │  │
│  │  • Reference resolution  • Circular detection  • Merging  │  │
│  └────────────────────────────┬─────────────────────────────┘  │
│                               ▼                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Token Registry                         │  │
│  │  • In-memory store  • Path indexing  • Change tracking    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│  Translation  │       │     API       │       │    Plugins    │
│    Engine     │       │    Server     │       │    System     │
└───────┬───────┘       └───────────────┘       └───────────────┘
        │
        ├──► CSS Variables
        ├──► TypeScript
        ├──► Swift/iOS
        ├──► Kotlin/Android
        └──► Flutter/Dart
```

---

## Module Structure

```
@design-tokens/
├── core/                 # Core parsing and validation
│   ├── parser/          # JSON parsing, syntax
│   ├── validator/       # Type and rule validation
│   ├── resolver/        # Reference resolution
│   └── registry/        # Token storage and indexing
│
├── types/               # TypeScript type definitions
│   ├── tokens.ts        # Token interfaces
│   ├── values.ts        # Value type definitions
│   └── config.ts        # Configuration types
│
├── transforms/          # Platform transformations
│   ├── css/
│   ├── typescript/
│   ├── swift/
│   ├── kotlin/
│   └── dart/
│
├── cli/                 # Command-line interface
│
├── integrations/        # Tool integrations
│   ├── figma/
│   ├── vscode/
│   └── github/
│
└── server/              # API server
```

---

## Core Data Structures

### Token Node

```typescript
interface TokenNode {
  name: string;
  path: string[];
  type: TokenType;
  value: TokenValue | Reference;
  resolvedValue?: TokenValue;
  description?: string;
  deprecated?: boolean | string;
  extensions?: Record<string, unknown>;
  parent?: GroupNode;
}
```

### Group Node

```typescript
interface GroupNode {
  name: string;
  path: string[];
  type?: TokenType; // inherited by children
  description?: string;
  deprecated?: boolean | string;
  extensions?: Record<string, unknown>;
  extends?: Reference;
  children: Map<string, TokenNode | GroupNode>;
  rootToken?: TokenNode;
  parent?: GroupNode;
}
```

### Reference

```typescript
interface CurlyBraceReference {
  type: "curly";
  path: string[];
  raw: string;
}

interface JsonPointerReference {
  type: "pointer";
  pointer: string;
  raw: string;
}

type Reference = CurlyBraceReference | JsonPointerReference;
```

### Token Registry

```typescript
interface TokenRegistry {
  // Token access
  get(path: string | string[]): TokenNode | undefined;
  getGroup(path: string | string[]): GroupNode | undefined;

  // Iteration
  tokens(): Iterable<TokenNode>;
  groups(): Iterable<GroupNode>;

  // Queries
  byType(type: TokenType): TokenNode[];
  byExtension(namespace: string): TokenNode[];

  // Modification
  set(path: string[], token: TokenNode): void;
  delete(path: string[]): boolean;

  // Resolution
  resolve(ref: Reference): TokenValue;
  resolveAll(): void;
}
```

---

## Parser Pipeline

```
Input JSON
    │
    ▼
┌─────────────────┐
│  Lexical Parse  │  JSON.parse() or JSON5
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Structure Pass │  Identify tokens vs groups
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Type Pass      │  Resolve type inheritance
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Reference Pass │  Parse and validate references
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validation     │  Type check all values
└────────┬────────┘
         │
         ▼
   Token Registry
```

---

## Reference Resolution Algorithm

```
function resolveReference(ref, visited = Set()):
    if ref in visited:
        throw CircularReferenceError

    visited.add(ref)

    target = lookupTarget(ref)

    if target is Reference:
        return resolveReference(target, visited)

    return target
```

### Lookup Strategies

**Curly Brace**: Split on `.`, traverse tree, return `$value`

**JSON Pointer**: Parse RFC 6901, traverse raw JSON, return target

---

## Translation Pipeline

```
Token Registry
    │
    ▼
┌─────────────────┐
│  Filter         │  Include/exclude by pattern
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Transform      │  Apply platform transforms
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Format         │  Generate output syntax
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Write          │  Output to files
└────────┬────────┘
         │
         ▼
   Platform Files
```

### Transform Interface

```typescript
interface TokenTransform {
  name: string;
  type?: TokenType; // filter by type

  match?(token: TokenNode): boolean;
  transform(token: TokenNode, config: TransformConfig): TransformedValue;
}
```

### Formatter Interface

```typescript
interface OutputFormatter {
  name: string;
  extension: string;

  header?(tokens: TokenNode[], config: FormatterConfig): string;
  format(token: TokenNode, value: TransformedValue): string;
  footer?(tokens: TokenNode[], config: FormatterConfig): string;
}
```

---

## Configuration Schema

```typescript
interface ToolkitConfig {
  // Input
  source: string | string[];

  // Processing
  include?: string[];
  exclude?: string[];
  resolveReferences?: boolean;

  // Output
  platforms: {
    [name: string]: PlatformConfig;
  };
}

interface PlatformConfig {
  transforms?: string[];
  formatter: string;
  output: string;

  // Platform-specific
  prefix?: string;
  suffix?: string;
  naming?: "camelCase" | "kebab-case" | "snake_case" | "PascalCase";
}
```

---

## Error Handling

### Error Types

```typescript
enum ErrorCode {
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
}
```

### Error Object

```typescript
interface TokenError {
  code: ErrorCode;
  message: string;
  path: string[];
  location?: {
    line: number;
    column: number;
  };
  severity: "error" | "warning";
}
```

---

## Plugin System

### Plugin Interface

```typescript
interface Plugin {
  name: string;

  // Lifecycle hooks
  beforeParse?(input: string): string;
  afterParse?(registry: TokenRegistry): void;
  beforeTransform?(tokens: TokenNode[]): TokenNode[];
  afterTransform?(output: Map<string, string>): void;

  // Extensions
  transforms?: TokenTransform[];
  formatters?: OutputFormatter[];
  validators?: TokenValidator[];
}
```

### Plugin Registration

```typescript
const toolkit = createToolkit({
  plugins: [
    cssPlugin(),
    typescriptPlugin(),
    customPlugin({...})
  ]
});
```

---

## CLI Commands

```bash
# Validate token files
dtcg validate ./tokens/**/*.tokens

# Translate to platforms
dtcg build --config dtcg.config.json

# Watch mode
dtcg build --watch

# Single platform
dtcg build --platform css

# Output resolved tokens
dtcg resolve ./tokens/colors.tokens --output resolved.json

# Generate types
dtcg types --output types.d.ts
```

---

## API Endpoints

```
GET  /tokens              # List all tokens
GET  /tokens/:path        # Get token by path
GET  /tokens?type=color   # Filter by type

POST /tokens              # Create token
PUT  /tokens/:path        # Update token
DELETE /tokens/:path      # Delete token

GET  /groups              # List all groups
GET  /groups/:path        # Get group with children

POST /translate           # Translate tokens
  { platform: "css", tokens: [...] }

GET  /validate            # Validate all
POST /validate            # Validate payload
```

---

## Performance Considerations

1. **Lazy Resolution**: Don't resolve references until values needed
2. **Path Indexing**: Build hash map for O(1) token lookup
3. **Incremental Parsing**: Support partial updates for watch mode
4. **Caching**: Cache resolved values, invalidate on dependency change
5. **Streaming Output**: Write large outputs incrementally
6. **Parallel Transforms**: Process platforms concurrently
