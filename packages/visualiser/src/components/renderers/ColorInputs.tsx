import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import { TextField } from "@kobalte/core/text-field";
import type { ColorValue } from "@xray/schema";
import {
  colorSpaceLabel,
  componentLabels,
  formatComponent,
  srgbToHex,
} from "../../utils/colorUtils";

interface ColorInputsProps {
  value: ColorValue;
}

export const ColorInputs: Component<ColorInputsProps> = (props) => {
  const labels = () => componentLabels(props.value.colorSpace);
  const alpha = () => props.value.alpha ?? 1;
  const canShowHex = () => props.value.colorSpace === "srgb";

  return (
    <div class="space-y-3">
      {/* Color Space */}
      <div>
        <label class="block text-xs text-neutral-500 mb-1">Color Space</label>
        <div class="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-sm rounded border border-neutral-200">
          {colorSpaceLabel(props.value.colorSpace)}
        </div>
      </div>

      {/* Components */}
      <div class="grid grid-cols-3 gap-2">
        <For each={props.value.components.slice(0, 3)}>
          {(component, index) => (
            <TextField>
              <TextField.Label class="block text-xs text-neutral-500 mb-1">
                {labels()[index()]}
              </TextField.Label>
              <TextField.Input
                value={formatComponent(
                  component,
                  props.value.colorSpace,
                  index()
                )}
                readOnly
                class="w-full px-2 py-1.5 bg-neutral-50 text-neutral-700 text-sm rounded border border-neutral-200 font-mono"
              />
            </TextField>
          )}
        </For>
      </div>

      {/* Alpha */}
      <TextField>
        <TextField.Label class="block text-xs text-neutral-500 mb-1">
          Alpha
        </TextField.Label>
        <TextField.Input
          value={alpha().toFixed(2)}
          readOnly
          class="w-full px-2 py-1.5 bg-neutral-50 text-neutral-700 text-sm rounded border border-neutral-200 font-mono"
        />
      </TextField>

      {/* Hex (for sRGB) */}
      <Show when={canShowHex()}>
        <TextField>
          <TextField.Label class="block text-xs text-neutral-500 mb-1">
            Hex
          </TextField.Label>
          <TextField.Input
            value={srgbToHex(props.value.components, alpha())}
            readOnly
            class="w-full px-2 py-1.5 bg-neutral-50 text-neutral-700 text-sm rounded border border-neutral-200 font-mono uppercase"
          />
        </TextField>
      </Show>
    </div>
  );
};
