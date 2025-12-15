import type { Component } from "solid-js";
import { useTokens } from "../../context/TokenContext";
import { CodeViewer } from "../code/CodeViewer";

export const CodePanel: Component = () => {
  const { rawContent, fileName } = useTokens();

  return (
    <aside class="w-[480px] flex-shrink-0 border-r border-neutral-200 bg-neutral-900 flex flex-col">
      <div class="px-4 py-3 border-b border-neutral-700 flex items-center justify-between">
        <span class="text-sm font-medium text-neutral-300">{fileName()}</span>
        <span class="text-xs text-neutral-500">JSON</span>
      </div>
      <div class="flex-1 overflow-auto">
        <CodeViewer code={rawContent()} theme="dark" />
      </div>
    </aside>
  );
};
