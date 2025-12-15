import { type Component, createResource, createMemo, Show } from "solid-js";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

// Lazy-load the highlighter with only JSON language
let highlighterPromise: Promise<HighlighterCore> | null = null;

async function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [
        import("shiki/themes/github-dark.mjs"),
        import("shiki/themes/github-light.mjs"),
      ],
      langs: [import("shiki/langs/json.mjs")],
      engine: createOnigurumaEngine(import("shiki/wasm")),
    });
  }
  return highlighterPromise;
}

interface CodeViewerProps {
  code: string;
  theme?: "light" | "dark";
}

export const CodeViewer: Component<CodeViewerProps> = (props) => {
  const theme = () => props.theme ?? "dark";

  const [highlighter] = createResource(getHighlighter);

  const highlightedCode = createMemo(() => {
    const hl = highlighter();
    if (!hl) return null;

    return hl.codeToHtml(props.code, {
      lang: "json",
      theme: theme() === "dark" ? "github-dark" : "github-light",
    });
  });

  return (
    <div class="h-full overflow-auto rounded-lg">
      <Show
        when={highlightedCode()}
        fallback={
          <pre class="p-4 bg-neutral-900 text-neutral-300 text-sm font-mono overflow-auto">
            <code>{props.code}</code>
          </pre>
        }
      >
        <div
          class="text-sm [&_pre]:p-4 [&_pre]:m-0 [&_pre]:overflow-auto [&_pre]:h-full"
          innerHTML={highlightedCode()!}
        />
      </Show>
    </div>
  );
};
