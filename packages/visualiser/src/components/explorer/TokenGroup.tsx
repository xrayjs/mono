import { type Component, For, Show, createSignal } from "solid-js";
import { Collapsible } from "@kobalte/core/collapsible";
import type { ColorGroup } from "../../hooks/useTokenParser";
import { TokenCard } from "./TokenCard";
import { ColorRenderer } from "../renderers/ColorRenderer";

interface TokenGroupProps {
  group: ColorGroup;
  level?: number;
}

export const TokenGroup: Component<TokenGroupProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(true);
  const level = props.level ?? 0;

  return (
    <Collapsible open={isOpen()} onOpenChange={setIsOpen} class="mb-4">
      <Collapsible.Trigger class="flex items-center gap-2 w-full text-left group">
        <span
          class="w-5 h-5 flex items-center justify-center text-neutral-400 group-hover:text-neutral-600 transition-colors"
          style={{ transform: isOpen() ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 2L8 6L4 10" />
          </svg>
        </span>
        <span class="font-medium text-neutral-900">{props.group.name}</span>
        <span class="text-sm text-neutral-400">
          ({props.group.tokens.length + props.group.groups.length} items)
        </span>
      </Collapsible.Trigger>

      <Show when={props.group.description}>
        <p class="text-sm text-neutral-500 ml-7 mt-1">{props.group.description}</p>
      </Show>

      <Collapsible.Content class="mt-3 ml-5 pl-2 border-l border-neutral-200">
        {/* Render direct tokens */}
        <Show when={props.group.tokens.length > 0}>
          <div
            class="grid gap-4 mb-4"
            style={{
              "grid-template-columns": "repeat(auto-fill, minmax(280px, 1fr))",
            }}
          >
            <For each={props.group.tokens}>
              {(token) => (
                <TokenCard
                  name={token.name}
                  path={token.path}
                  description={token.description}
                  deprecated={token.deprecated}
                >
                  <ColorRenderer value={token.value} />
                </TokenCard>
              )}
            </For>
          </div>
        </Show>

        {/* Render nested groups */}
        <For each={props.group.groups}>
          {(nestedGroup) => (
            <TokenGroup group={nestedGroup} level={level + 1} />
          )}
        </For>
      </Collapsible.Content>
    </Collapsible>
  );
};
