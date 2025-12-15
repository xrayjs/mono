import {
  createContext,
  useContext,
  createSignal,
  type ParentComponent,
  type Accessor,
  onMount,
} from "solid-js";
import { exampleTokens } from "../data/exampleTokens";
import {
  parseTokenFile,
  parseTokenObject,
  type ParseResult,
  type ColorToken,
  type ColorGroup,
} from "../hooks/useTokenParser";

interface TokenContextValue {
  /** Current file name */
  fileName: Accessor<string>;
  /** Raw JSON content as string */
  rawContent: Accessor<string>;
  /** All color tokens (flattened) */
  colorTokens: Accessor<ColorToken[]>;
  /** Color tokens organized in groups */
  colorGroups: Accessor<ColorGroup[]>;
  /** Any parsing errors */
  errors: Accessor<string[]>;
  /** Load tokens from a file */
  loadFile: (file: File) => Promise<void>;
  /** Load tokens from JSON string */
  loadJson: (content: string, fileName: string) => void;
  /** Reset to example tokens */
  resetToExample: () => void;
}

const TokenContext = createContext<TokenContextValue>();

export const TokenProvider: ParentComponent = (props) => {
  const [parseResult, setParseResult] = createSignal<ParseResult>({
    fileName: "Example",
    colorGroups: [],
    colorTokens: [],
    errors: [],
  });
  const [rawContent, setRawContent] = createSignal<string>("");

  // Load example tokens on mount
  onMount(() => {
    resetToExample();
  });

  const resetToExample = () => {
    const result = parseTokenObject(exampleTokens, "Example Tokens");
    setParseResult(result);
    // Format the example tokens as pretty JSON
    setRawContent(JSON.stringify(exampleTokens, null, 2));
  };

  const loadJson = (content: string, fileName: string) => {
    const result = parseTokenFile(content, fileName);
    setParseResult(result);
    // Try to pretty-print the JSON, fallback to raw if invalid
    try {
      const parsed = JSON.parse(content);
      setRawContent(JSON.stringify(parsed, null, 2));
    } catch {
      setRawContent(content);
    }
  };

  const loadFile = async (file: File): Promise<void> => {
    const content = await file.text();
    loadJson(content, file.name);
  };

  const value: TokenContextValue = {
    fileName: () => parseResult().fileName,
    rawContent,
    colorTokens: () => parseResult().colorTokens,
    colorGroups: () => parseResult().colorGroups,
    errors: () => parseResult().errors,
    loadFile,
    loadJson,
    resetToExample,
  };

  return (
    <TokenContext.Provider value={value}>
      {props.children}
    </TokenContext.Provider>
  );
};

export function useTokens(): TokenContextValue {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useTokens must be used within a TokenProvider");
  }
  return context;
}
