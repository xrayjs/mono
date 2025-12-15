import type { Component, JSX } from "solid-js";
import { Show } from "solid-js";

interface TokenCardProps {
  name: string;
  path: string;
  description?: string;
  deprecated?: boolean | string;
  children: JSX.Element;
}

export const TokenCard: Component<TokenCardProps> = (props) => {
  return (
    <div class="bg-white rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 transition-colors">
      <div class="flex items-start justify-between mb-3">
        <div>
          <h3 class="font-medium text-neutral-900">{props.name}</h3>
          <p class="text-xs text-neutral-400 font-mono">{props.path}</p>
        </div>
        <Show when={props.deprecated}>
          <span class="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
            {typeof props.deprecated === "string" ? props.deprecated : "Deprecated"}
          </span>
        </Show>
      </div>

      <Show when={props.description}>
        <p class="text-sm text-neutral-500 mb-3">{props.description}</p>
      </Show>

      {props.children}
    </div>
  );
};
