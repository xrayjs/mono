import type { Component } from "solid-js";
import { useTokens } from "../../context/TokenContext";

export const Header: Component = () => {
  const { fileName, resetToExample } = useTokens();

  return (
    <header class="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold text-neutral-900">Token Visualizer</h1>
        <span class="px-2 py-1 text-sm bg-neutral-100 text-neutral-600 rounded">
          {fileName()}
        </span>
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          onClick={resetToExample}
          class="px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
        >
          Reset to Example
        </button>
        <span class="text-sm text-neutral-400">
          Drop a .json file anywhere to load
        </span>
      </div>
    </header>
  );
};
