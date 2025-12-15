import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import { useTokens } from "../../context/TokenContext";
import { TokenGroup } from "./TokenGroup";

export const TokenExplorer: Component = () => {
  const { colorGroups, colorTokens, errors } = useTokens();

  return (
    <div class="max-w-6xl mx-auto">
      {/* Error display */}
      <Show when={errors().length > 0}>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 class="font-medium text-red-800 mb-2">Parsing Errors</h3>
          <ul class="list-disc list-inside text-sm text-red-700">
            <For each={errors()}>
              {(error) => <li>{error}</li>}
            </For>
          </ul>
        </div>
      </Show>

      {/* Stats */}
      <div class="mb-6 flex items-center gap-4">
        <span class="text-sm text-neutral-500">
          {colorTokens().length} color tokens
        </span>
        <span class="text-sm text-neutral-500">
          {colorGroups().length} groups
        </span>
      </div>

      {/* Token groups */}
      <Show
        when={colorGroups().length > 0}
        fallback={
          <div class="text-center py-12 text-neutral-400">
            <p class="text-lg mb-2">No color tokens found</p>
            <p class="text-sm">
              Drop a token file with color definitions to visualize them
            </p>
          </div>
        }
      >
        <For each={colorGroups()}>
          {(group) => <TokenGroup group={group} />}
        </For>
      </Show>
    </div>
  );
};
